import { useState, useMemo } from 'react';
import {
  Box,
  Layers,
  ArrowRight,
  AlertCircle,
  Database,
  Cpu,
  Activity,
  RefreshCw,
  Plus,
  Download,
  X,
  Trash2
} from 'lucide-react';
import Modal from '../components/Modal';
import WelcomeModal from '../components/WelcomeModal';
import DependencyDetails from '../components/DependencyDetails';
import DependencyActions from '../components/DependencyActions';
import VersionBumpButtons from '../components/VersionBumpButtons';
import GraphNode from '../components/GraphNode';
import { bumpString } from '../utils/versioning';
import { generateRandomGraph } from '../utils/randomGraph';
import { validateSessionData } from '../utils/security';

// --- Configuration & Initial Data ---

const INITIAL_NODES = [
  // Core
  { id: 'core:ext-models', org: 'core', artifactId: 'ext-models', label: 'ext-models', type: 'core', version: '1.0.0', category: 'Foundation' },
  { id: 'core:common-lib', org: 'core', artifactId: 'common-lib', label: 'common-lib', type: 'core', version: '1.0.0', category: 'Foundation' },

  // Repositories
  { id: 'data:repo-a', org: 'data', artifactId: 'repo-a', label: 'repo-a', type: 'repo', version: '1.0.0', category: 'Data Access' },
  { id: 'data:repo-b', org: 'data', artifactId: 'repo-b', label: 'repo-b', type: 'repo', version: '1.0.0', category: 'Data Access' },
  { id: 'data:repo-c', org: 'data', artifactId: 'repo-c', label: 'repo-c', type: 'repo', version: '1.0.0', category: 'Data Access' },
  { id: 'data:repo-d', org: 'data', artifactId: 'repo-d', label: 'repo-d', type: 'repo', version: '1.0.0', category: 'Data Access' },
  { id: 'data:repo-e', org: 'data', artifactId: 'repo-e', label: 'repo-e', type: 'repo', version: '1.0.0', category: 'Data Access' },

  // Readers
  { id: 'app:reader-a', org: 'app', artifactId: 'reader-a', label: 'reader-a', type: 'app', version: '2.1.0', category: 'Readers' },
  { id: 'app:reader-b', org: 'app', artifactId: 'reader-b', label: 'reader-b', type: 'app', version: '2.0.4', category: 'Readers' },
  { id: 'app:reader-c', org: 'app', artifactId: 'reader-c', label: 'reader-c', type: 'app', version: '2.1.1', category: 'Readers' },

  // Processors (Assumed dependencies based on prompt pattern)
  { id: 'app:proc-a', org: 'app', artifactId: 'proc-a', label: 'proc-a', type: 'app', version: '1.5.0', category: 'Processors' },
  { id: 'app:proc-b', org: 'app', artifactId: 'proc-b', label: 'proc-b', type: 'app', version: '1.2.0', category: 'Processors' },
];

const INITIAL_EDGES = [
  // Chain: ext.models -> common
  { source: 'core:ext-models', target: 'core:common-lib' },

  // Common -> Apps
  { source: 'core:common-lib', target: 'app:reader-a' },
  { source: 'core:common-lib', target: 'app:reader-b' },
  { source: 'core:common-lib', target: 'app:reader-c' },
  { source: 'core:common-lib', target: 'app:proc-a' },
  { source: 'core:common-lib', target: 'app:proc-b' },

  // Repos -> Reader A (A, C, D)
  { source: 'data:repo-a', target: 'app:reader-a' },
  { source: 'data:repo-c', target: 'app:reader-a' },
  { source: 'data:repo-d', target: 'app:reader-a' },

  // Repos -> Reader B (B, C, E)
  { source: 'data:repo-b', target: 'app:reader-b' },
  { source: 'data:repo-c', target: 'app:reader-b' },
  { source: 'data:repo-e', target: 'app:reader-b' },

  // Repos -> Reader C (A, D, E)
  { source: 'data:repo-a', target: 'app:reader-c' },
  { source: 'data:repo-d', target: 'app:reader-c' },
  { source: 'data:repo-e', target: 'app:reader-c' },

  // Repos -> Processor A (Simulated: A, B)
  { source: 'data:repo-a', target: 'app:proc-a' },
  { source: 'data:repo-b', target: 'app:proc-a' },

  // Repos -> Processor B (Simulated: C, D)
  { source: 'data:repo-c', target: 'app:proc-b' },
  { source: 'data:repo-d', target: 'app:proc-b' },
];

// --- Utilities ---

const getIcon = (type) => {
  switch(type) {
    case 'core': return <Box className="w-5 h-5 text-blue-500" />;
    case 'repo': return <Database className="w-5 h-5 text-emerald-500" />;
    case 'app': return <Cpu className="w-5 h-5 text-purple-500" />;
    default: return <Activity className="w-5 h-5" />;
  }
};

const categories = ['Foundation', 'Data Access', 'Readers', 'Processors'];


// --- Components ---

const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-xl shadow-sm border border-slate-200 ${className}`}>
    {children}
  </div>
);

const Badge = ({ children, color = "slate" }) => {
  const colors = {
    slate: "bg-slate-100 text-slate-700",
    blue: "bg-blue-100 text-blue-700",
    emerald: "bg-emerald-100 text-emerald-700",
    purple: "bg-purple-100 text-purple-700",
    amber: "bg-amber-100 text-amber-700",
    red: "bg-red-100 text-red-700",
  };
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-medium ${colors[color] || colors.slate}`}>
      {children}
    </span>
  );
};

export default function MainPage() {
  const [nodes, setNodes] = useState(INITIAL_NODES);
  const [edges, setEdges] = useState(INITIAL_EDGES);
  const [view, setView] = useState('dashboard');
  const [showWelcomeModal, setShowWelcomeModal] = useState(true);
  const [selectedNode, setSelectedNode] = useState(null);
  const [hoveredNode, setHoveredNode] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newDepData, setNewDepData] = useState({
    name: '',
    org: '',
    artifactId: '',
    version: '1.0.0',
    category: 'Foundation',
    consumers: []
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Release Management State
  const [showReleaseModal, setShowReleaseModal] = useState(false);
  const [releaseForm, setReleaseForm] = useState({ version: '', prLink: '', changelog: '' });
  const [pendingNodeId, setPendingNodeId] = useState(null);

  // Track which dependencies the nodes are currently "using".
  // In a real app, this would be in a lockfile. Here, we simulate that nodes store
  // a record of what version of a dependency they are built against.
  const [dependencyLocks, setDependencyLocks] = useState(() => {
    const locks = {};
    INITIAL_NODES.forEach(n => {
      locks[n.id] = {};
      // Initialize nodes to use the current version of their upstream dependencies
      INITIAL_EDGES.filter(e => e.target === n.id).forEach(e => {
        const upstreamNode = INITIAL_NODES.find(un => un.id === e.source);
        if (upstreamNode) {
          locks[n.id][upstreamNode.id] = upstreamNode.version;
        }
      });
    });
    return locks;
  });

  // Create a map of nodes keyed by ID for O(1) lookups
  const nodesMap = useMemo(() =>
    new Map(nodes.map(node => [node.id, node])),
    [nodes]
  );

  // Calculate connections
  const connections = useMemo(() => {
    const downstream = {}; // Key: Source, Value: [Targets]
    const upstream = {};   // Key: Target, Value: [Sources]

    edges.forEach(({ source, target }) => {
      if (!downstream[source]) downstream[source] = [];
      downstream[source].push(target);

      if (!upstream[target]) upstream[target] = [];
      upstream[target].push(source);
    });
    return { downstream, upstream };
  }, [edges]);

  // Determine which nodes are outdated (Boolean only) - Optimized O(N+E)
  const nodeStatusMap = useMemo(() => {
    const statusMap = {}; // nodeId -> { isOutdated: boolean }
    const memo = {};

    const checkNodeStatus = (nodeId) => {
      if (memo[nodeId] !== undefined) return memo[nodeId];

      const node = nodesMap.get(nodeId);
      if (!node) return false;

      const directLocks = dependencyLocks[node.id] || {};

      // Check direct dependencies
      for (const [depId, lockedVersion] of Object.entries(directLocks)) {
        const actualDep = nodesMap.get(depId);
        if (actualDep && actualDep.version !== lockedVersion) {
          memo[nodeId] = true;
          return true;
        }
      }

      // Recursively check upstream dependencies
      const upstreamDeps = connections.upstream[node.id] || [];
      for (const depId of upstreamDeps) {
        if (checkNodeStatus(depId)) {
          memo[nodeId] = true;
          return true;
        }
      }

      memo[nodeId] = false;
      return false;
    };

    nodes.forEach(node => {
      statusMap[node.id] = { isOutdated: checkNodeStatus(node.id) };
    });

    return statusMap;
  }, [nodes, dependencyLocks, connections, nodesMap]);

  // Determine detailed outliers ONLY for the selected node
  const selectedNodeOutliers = useMemo(() => {
    if (!selectedNode) return { isOutdated: false, outliers: [] };

    const memo = {};

    const checkNodeStateDetailed = (nodeId) => {
      if (memo[nodeId]) return memo[nodeId];

      const node = nodesMap.get(nodeId);
      if (!node) {
        return { isOutdated: false, outliers: [] };
      }

      const directLocks = dependencyLocks[node.id] || {};
      const directOutliers = [];

      for (const [depId, lockedVersion] of Object.entries(directLocks)) {
        const actualDep = nodesMap.get(depId);
        if (actualDep && actualDep.version !== lockedVersion) {
          directOutliers.push({
            name: actualDep.label,
            current: actualDep.version,
            using: lockedVersion
          });
        }
      }

      const upstreamDeps = connections.upstream[node.id] || [];
      const transitiveOutliersMap = new Map();
      let isTransitivelyOutdated = false;

      for (const depId of upstreamDeps) {
        const depState = checkNodeStateDetailed(depId);
        if (depState.isOutdated) {
          isTransitivelyOutdated = true;
          if (depState.outliers) {
            for (const outlier of depState.outliers) {
              if (!transitiveOutliersMap.has(outlier.name)) {
                transitiveOutliersMap.set(outlier.name, outlier);
              }
            }
          }
        }
      }

      const transitiveOutliers = Array.from(transitiveOutliersMap.values());
      const isOutdated = directOutliers.length > 0 || isTransitivelyOutdated;

      const result = {
        isOutdated,
        outliers: [...directOutliers, ...transitiveOutliers],
        isTransitivelyOutdated
      };
      memo[nodeId] = result;
      return result;
    };

    return checkNodeStateDetailed(selectedNode);
  }, [selectedNode, nodesMap, dependencyLocks, connections]);

  // Handle delete node
  const handleDeleteNode = () => {
    if (!selectedNode) return;

    // Remove from nodes
    setNodes(prev => prev.filter(n => n.id !== selectedNode));

    // Remove edges connected to this node
    setEdges(prev => prev.filter(e => e.source !== selectedNode && e.target !== selectedNode));

    // Reset selection
    setSelectedNode(null);
    setShowDeleteConfirm(false);
  };

  // Handle version bump (opens modal)
  const handleBump = (nodeId, type) => {
    const node = nodesMap.get(nodeId);
    if (!node) return;

    const nextVersion = bumpString(node.version, type);
    setPendingNodeId(nodeId);
    setReleaseForm({ version: nextVersion, prLink: '', changelog: '' });
    setShowReleaseModal(true);
  };

  // Handle confirm release
  const handleConfirmRelease = () => {
    if (!pendingNodeId) return;

    setNodes(prev => prev.map(n => {
      if (n.id === pendingNodeId) {
        return {
          ...n,
          version: releaseForm.version,
          history: [
            ...(n.history || []),
            {
              version: releaseForm.version,
              prLink: releaseForm.prLink,
              changelog: releaseForm.changelog,
              date: new Date().toISOString()
            }
          ]
        };
      }
      return n;
    }));

    setShowReleaseModal(false);
    setPendingNodeId(null);
  };

  // Handle "Updating" a node (rebuilding it with latest deps)
  const handleRebuildNode = (nodeId) => {
    setDependencyLocks(prev => {
      const newLocks = { ...prev };
      newLocks[nodeId] = {};

      // Look up all sources for this node
      const sources = connections.upstream[nodeId] || [];
      sources.forEach(sourceId => {
        const sourceNode = nodesMap.get(sourceId);
        if (sourceNode) {
          newLocks[nodeId][sourceId] = sourceNode.version;
        }
      });
      return newLocks;
    });

    // Also bump the node version itself because its code changed
    handleBump(nodeId, 'patch');
  };

  const handleNodeDeselect = () => {
    setSelectedNode(null);
  };

  const handleUpdateDependencies = (nodeId, newUpstreamIds) => {
    // 1. Update Edges
    setEdges(prev => {
      // Remove all old upstream edges for this node
      const filtered = prev.filter(e => e.target !== nodeId);
      // Add new edges from the new dependencies
      const newEdges = newUpstreamIds.map(sourceId => ({
        source: sourceId,
        target: nodeId
      }));
      return [...filtered, ...newEdges];
    });

    // 2. Update Dependency Locks
    setDependencyLocks(prev => {
      const next = { ...prev };
      const newLocks = {};
      newUpstreamIds.forEach(sourceId => {
        const sourceNode = nodesMap.get(sourceId);
        if (sourceNode) {
          newLocks[sourceId] = sourceNode.version;
        }
      });
      next[nodeId] = newLocks;
      return next;
    });

    // 3. (Optional) Re-bump the version since its dependencies changed
    handleBump(nodeId, 'patch');
  };

  // Compute related nodes once per hover/select change for O(1) lookup during render
  const { directUpstream, transitiveUpstream } = useMemo(() => {
    if (!selectedNode) return { directUpstream: [], transitiveUpstream: [] };

    const direct = connections.upstream[selectedNode] || [];
    const transitive = new Set();
    const queue = [...direct];
    const visited = new Set(direct);
    visited.add(selectedNode); // Don't include the node itself
    let head = 0;

    // Optimization: Use index pointer instead of shift() to avoid O(n) array operations
    while (head < queue.length) {
      const current = queue[head++];
      const neighbors = connections.upstream[current] || [];
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          transitive.add(neighbor);
          queue.push(neighbor);
        }
      }
    }

    return {
      directUpstream: direct,
      transitiveUpstream: Array.from(transitive)
    };
  }, [selectedNode, connections]);

  const relatedNodesSet = useMemo(() => {
    const rootId = hoveredNode || selectedNode;
    if (!rootId) return null; // Return null to indicate no filter

    const related = new Set();

    const traverse = (start, direction) => {
      const queue = [start];
      const visited = new Set([start]);
      related.add(start);
      let head = 0;

      // Optimization: Use index pointer instead of shift() to avoid O(n) array operations
      while(head < queue.length) {
        const current = queue[head++];
        const neighbors = connections[direction][current] || [];
        for (const neighbor of neighbors) {
          if (!visited.has(neighbor)) {
            visited.add(neighbor);
            related.add(neighbor);
            queue.push(neighbor);
          }
        }
      }
    };

    traverse(rootId, 'downstream');
    traverse(rootId, 'upstream');

    return related;
  }, [hoveredNode, selectedNode, connections]);

  const nodesByCategory = useMemo(() => {
    const groups = {};
    categories.forEach(cat => {
      groups[cat] = [];
    });
    nodes.forEach(node => {
      if (groups[node.category]) {
        groups[node.category].push(node);
      }
    });
    return groups;
  }, [nodes]);

  const handleAddDependency = () => {
    // 1. Create new Node
    let newId;
    if (newDepData.org && newDepData.artifactId) {
      newId = `${newDepData.org}:${newDepData.artifactId}`.toLowerCase();
    } else {
      newId = newDepData.name.toLowerCase().replace(/\s+/g, '-');
    }

    // Check for duplicate ID
    if (nodes.some(n => n.id === newId)) {
      alert('A dependency with this ID already exists.');
      return;
    }

    const newNode = {
      id: newId,
      label: newDepData.name,
      org: newDepData.org,
      artifactId: newDepData.artifactId,
      type: newDepData.category === 'Foundation' ? 'core' : 'repo',
      version: newDepData.version,
      category: newDepData.category
    };

    setNodes(prev => [...prev, newNode]);

    // 2. Create Edges
    const newEdges = newDepData.consumers.map(consumerId => ({
      source: newId,
      target: consumerId
    }));

    setEdges(prev => [...prev, ...newEdges]);

    // 3. Update Dependency Locks (record that consumers use this new version)
    setDependencyLocks(prev => {
      const next = { ...prev };
      newDepData.consumers.forEach(consumerId => {
        if (!next[consumerId]) {
          next[consumerId] = {};
        }
        next[consumerId][newId] = newDepData.version;
      });
      // Also add the new node itself to the locks
      next[newId] = {};
      return next;
    });

    // Reset and Close
    setIsAddModalOpen(false);
    setNewDepData({
      name: '',
      org: '',
      artifactId: '',
      version: '1.0.0',
      category: 'Foundation',
      consumers: []
    });
  };

  const handleGenerateRandomGraph = () => {
    const { nodes, edges, dependencyLocks } = generateRandomGraph();
    setNodes(nodes);
    setEdges(edges);
    setDependencyLocks(dependencyLocks);
    setShowWelcomeModal(false);
  };

  const handleStartFresh = () => {
    setNodes([]);
    setEdges([]);
    setDependencyLocks({});
    setShowWelcomeModal(false);
  };

  const handleDownloadSession = () => {
    const sessionData = {
      nodes,
      edges,
      dependencyLocks,
    };
    const jsonString = JSON.stringify(sessionData, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "depmanager-session.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type === "application/json") {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const sessionData = JSON.parse(e.target.result);
          const validation = validateSessionData(sessionData);
          if (validation.isValid) {
            setNodes(sessionData.nodes);
            setEdges(sessionData.edges);
            setDependencyLocks(sessionData.dependencyLocks);
            setShowWelcomeModal(false);
          } else {
            alert("Invalid session file: " + validation.error);
          }
        } catch (error) {
          alert("Error parsing JSON file: " + error.message);
        }
      };
      reader.readAsText(file);
    } else {
      alert("Please upload a valid .json file.");
    }
  };

  if (view === 'details' && selectedNode) {
    const node = nodesMap.get(selectedNode);
    if (node) {
      const upstream = connections.upstream[node.id] || [];
      const downstream = connections.downstream[node.id] || [];
      return (
        <DependencyDetails
          node={node}
          onBack={() => setView('dashboard')}
          upstreamIds={upstream}
          downstreamIds={downstream}
          nodesMap={nodesMap}
          onNodeSelect={setSelectedNode}
        />
      );
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans p-6">
      {showWelcomeModal && (
        <WelcomeModal
          onUpload={handleFileUpload}
          onNew={handleStartFresh}
          onRandom={handleGenerateRandomGraph}
        />
      )}
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2 text-slate-800">
              <Layers className="text-indigo-600" />
              DepManager <span className="text-slate-400 font-light hidden sm:inline">Microservice Version Control</span>
            </h1>
            <p className="text-slate-500 mt-1">Visualize dependency chains and manage release consistency.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
             <button
              onClick={handleDownloadSession}
              className="flex items-center gap-2 px-4 py-2 bg-slate-600 text-white rounded-lg shadow-sm hover:bg-slate-700 transition-colors text-sm font-medium"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Download Session</span>
              <span className="sm:hidden">Download</span>
            </button>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg shadow-sm hover:bg-indigo-700 transition-colors text-sm font-medium"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add Dependency</span>
               <span className="sm:hidden">Add</span>
            </button>
            <div className="flex gap-2 text-sm text-slate-600 bg-white px-4 py-2 rounded-lg shadow-sm border border-slate-200">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-slate-300"></span> Stable
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span> Outdated
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-500"></span> Selected
              </div>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">

          {/* Main Visualization Board */}
          <Card className="xl:col-span-3 p-4 sm:p-6 min-h-[600px] overflow-x-auto relative">
            {/* Overlay to deselect node */}
            {selectedNode && (
              <div
                onClick={handleNodeDeselect}
                role="button"
                aria-label="Deselect Node"
                tabIndex={-1} // Not focusable, just for clicking
                className="absolute inset-0 bg-black/10 z-10 cursor-pointer"
              />
            )}
            <div className="flex flex-col xl:flex-row justify-between xl:min-w-[800px] h-full gap-8">
              {categories.map((cat) => (
                <div key={cat} className="flex-1 flex flex-col gap-4 relative xl:border-none border-b border-slate-200 xl:pb-0 pb-8 last:border-b-0 z-20">
                  <div className="text-xs uppercase tracking-wider font-semibold text-slate-400 border-b border-slate-200 pb-2 mb-2">
                    {cat}
                  </div>

                  {(nodesByCategory[cat] || []).map(node => {
                    const isHighlighted = !relatedNodesSet || relatedNodesSet.has(node.id);
                    const isSelected = selectedNode === node.id;
                    const status = nodeStatusMap[node.id];

                    return (
                      <GraphNode
                        key={node.id}
                        node={node}
                        isSelected={isSelected}
                        isHighlighted={isHighlighted}
                        isOutdated={status.isOutdated}
                        hasUpstream={!!connections.upstream[node.id]}
                        hasDownstream={!!connections.downstream[node.id]}
                        onSelect={setSelectedNode}
                        onHover={setHoveredNode}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </Card>

          {/* Sidebar Inspector */}
          <div className="space-y-6">
            <Card className="p-5 h-full flex flex-col">
              {!selectedNode ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-400 text-center py-10">
                  <Activity className="w-12 h-12 mb-3 opacity-20" />
                  <p>Select a microservice or library to manage dependencies.</p>
                </div>
              ) : (
                (() => {
                  const node = nodes.find(n => n.id === selectedNode);
                  const status = selectedNodeOutliers;
                  const upstream = connections.upstream[node.id] || [];
                  const downstream = connections.downstream[node.id] || [];

                  return (
                    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                      <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-100">
                        <div>
                          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                            {node.label}
                            <button
                               onClick={() => setShowDeleteConfirm(true)}
                               className="text-slate-400 hover:text-red-500 transition-colors"
                               title="Delete Dependency"
                               aria-label="Delete Dependency"
                             >
                               <Trash2 className="w-4 h-4" />
                             </button>
                          </h2>
                          <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold mt-1">
                            {node.category}
                          </div>
                        </div>
                        <div className="text-right">
                           <div className="text-2xl font-mono text-indigo-600 font-bold">v{node.version}</div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="space-y-4 mb-8">
                        {node.history && node.history.length > 0 && (
                          <button
                            onClick={() => setView('details')}
                            className="w-full py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg text-sm font-medium flex items-center justify-center gap-2"
                          >
                            <Box className="w-4 h-4" />
                            View Version History
                          </button>
                        )}
                        <div className="text-sm font-medium text-slate-700">Release Management</div>
                        <VersionBumpButtons node={node} handleBump={handleBump} />

                        {status.isOutdated && (
                          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                            <div className="flex items-start gap-2 mb-2">
                              <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5" />
                              <div className="text-sm font-semibold text-amber-800">Dependency Drift</div>
                            </div>
                            <div className="space-y-1 mb-3">
                              {status.outliers.map((o, i) => (
                                <div key={i} className="text-xs text-amber-700">
                                  Uses <span className="font-mono">{o.name}@{o.using}</span> (Latest: {o.current})
                                </div>
                              ))}
                            </div>
                            <button
                              onClick={() => handleRebuildNode(node.id)}
                              className="w-full py-2 bg-amber-500 hover:bg-amber-600 text-white rounded shadow-sm text-xs font-bold flex items-center justify-center gap-2 transition-colors"
                            >
                              <RefreshCw className="w-3 h-3" />
                              Rebuild & Bump Node
                            </button>
                          </div>
                        )}
                      </div>

                      <DependencyActions
                        selectedNode={node}
                        allNodes={nodes}
                        upstreamConnections={upstream}
                        onUpdateDependencies={handleUpdateDependencies}
                      />

                      {/* Dependency Lists */}
                      <div className="space-y-6">
                        {/* -- Immediate Dependencies -- */}
                        <div>
                          <h3 className="text-xs uppercase text-slate-400 font-bold mb-3 flex items-center gap-2">
                            Immediate Dependencies ({directUpstream.length})
                          </h3>
                          {directUpstream.length === 0 ? (
                            <p className="text-xs text-slate-400 italic">No immediate dependencies</p>
                          ) : (
                            <div className="space-y-2">
                              {directUpstream.map(uid => {
                                const upNode = nodesMap.get(uid);
                                return (
                                  <div
                                    key={uid}
                                    onClick={() => setSelectedNode(uid)}
                                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelectedNode(uid); } }}
                                    role="button"
                                    tabIndex={0}
                                    className="flex items-center justify-between p-2 bg-slate-50 rounded hover:bg-slate-100 cursor-pointer border border-transparent hover:border-slate-200 group"
                                  >
                                    <div className="flex items-center gap-2">
                                      {getIcon(upNode.type)}
                                      <span className="text-sm text-slate-600 group-hover:text-indigo-600">{upNode.label}</span>
                                    </div>
                                    <Badge color="slate">v{upNode.version}</Badge>
                                  </div>
                                )
                              })}
                            </div>
                          )}
                        </div>

                        {/* -- Transitive Dependencies -- */}
                        <div>
                          <h3 className="text-xs uppercase text-slate-400 font-bold mb-3 flex items-center gap-2">
                            Transitive Dependencies ({transitiveUpstream.length})
                          </h3>
                          {transitiveUpstream.length === 0 ? (
                            <p className="text-xs text-slate-400 italic">No transitive dependencies</p>
                          ) : (
                            <div className="space-y-2">
                              {transitiveUpstream.map(uid => {
                                const upNode = nodesMap.get(uid);
                                return (
                                  <div
                                    key={uid}
                                    onClick={() => setSelectedNode(uid)}
                                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelectedNode(uid); } }}
                                    role="button"
                                    tabIndex={0}
                                    className="flex items-center justify-between p-2 bg-slate-50 rounded hover:bg-slate-100 cursor-pointer border border-transparent hover:border-slate-200 group"
                                  >
                                    <div className="flex items-center gap-2 opacity-70">
                                      {getIcon(upNode.type)}
                                      <span className="text-sm text-slate-500 group-hover:text-indigo-600">{upNode.label}</span>
                                    </div>
                                    <Badge color="slate">v{upNode.version}</Badge>
                                  </div>
                                )
                              })}
                            </div>
                          )}
                        </div>


                        {/* Downstream */}
                        <div>
                          <h3 className="text-xs uppercase text-slate-400 font-bold mb-3 flex items-center gap-2">
                            <ArrowRight className="w-3 h-3" /> Used By ({downstream.length})
                          </h3>
                          {downstream.length === 0 ? (
                            <p className="text-xs text-slate-400 italic">No downstream consumers</p>
                          ) : (
                            <div className="space-y-2">
                              {downstream.map(did => {
                                const downNode = nodesMap.get(did);
                                return (
                                  <div
                                    key={did}
                                    onClick={() => setSelectedNode(did)}
                                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelectedNode(did); } }}
                                    role="button"
                                    tabIndex={0}
                                    className="flex items-center justify-between p-2 bg-slate-50 rounded hover:bg-slate-100 cursor-pointer border border-transparent hover:border-slate-200 group"
                                  >
                                    <div className="flex items-center gap-2">
                                      {getIcon(downNode.type)}
                                      <span className="text-sm text-slate-600 group-hover:text-indigo-600">{downNode.label}</span>
                                    </div>
                                    <Badge color="slate">v{downNode.version}</Badge>
                                  </div>
                                )
                              })}
                            </div>
                          )}
                        </div>
                      </div>

                    </div>
                  );
                })()
              )}
            </Card>
          </div>
        </div>
      </div>

      {/* Add Dependency Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-800">Add New Dependency</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600" aria-label="Close modal">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Dependency Name (Label)</label>
                <input
                  type="text"
                  value={newDepData.name}
                  onChange={e => setNewDepData({...newDepData, name: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g. auth-service"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Organization</label>
                  <input
                    type="text"
                    value={newDepData.org}
                    onChange={e => setNewDepData({...newDepData, org: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="e.g. my-org"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Artifact ID</label>
                  <input
                    type="text"
                    value={newDepData.artifactId}
                    onChange={e => setNewDepData({...newDepData, artifactId: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="e.g. my-artifact"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Version</label>
                  <input
                    type="text"
                    value={newDepData.version}
                    onChange={e => setNewDepData({...newDepData, version: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="1.0.0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                  <select
                    value={newDepData.category}
                    onChange={e => setNewDepData({...newDepData, category: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                  >
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Used By (Consumers)</label>
                <div className="border border-slate-300 rounded-lg max-h-48 overflow-y-auto p-2 space-y-1">
                  {nodes.map(node => (
                    <label key={node.id} className="flex items-center gap-2 p-2 hover:bg-slate-50 rounded cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newDepData.consumers.includes(node.id)}
                        onChange={e => {
                          if (e.target.checked) {
                            setNewDepData(prev => ({...prev, consumers: [...prev.consumers, node.id]}));
                          } else {
                            setNewDepData(prev => ({...prev, consumers: prev.consumers.filter(id => id !== node.id)}));
                          }
                        }}
                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="text-sm text-slate-700">{node.label}</span>
                      <span className="text-xs text-slate-400 ml-auto">({node.type})</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-2">
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddDependency}
                  disabled={!newDepData.name}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Create Dependency
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      <Modal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        title="Delete Dependency"
        footer={
          <>
            <button
              onClick={() => setShowDeleteConfirm(false)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteNode}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Delete
            </button>
          </>
        }
      >
        <p className="text-slate-600">
          Are you sure you want to delete <span className="font-bold">{nodesMap.get(selectedNode)?.label}</span>?
          This action cannot be undone.
        </p>
      </Modal>

      {/* Release Modal */}
      <Modal
        isOpen={showReleaseModal}
        onClose={() => setShowReleaseModal(false)}
        title="Create New Release"
        footer={
          <>
            <button
              onClick={() => setShowReleaseModal(false)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmRelease}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Publish Release
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Version <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={releaseForm.version}
              onChange={(e) => setReleaseForm(prev => ({ ...prev, version: e.target.value }))}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              placeholder="1.0.0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Pull Request Link <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <input
              type="text"
              value={releaseForm.prLink}
              onChange={(e) => setReleaseForm(prev => ({ ...prev, prLink: e.target.value }))}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              placeholder="https://github.com/..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Changelog <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <textarea
              rows={3}
              value={releaseForm.changelog}
              onChange={(e) => setReleaseForm(prev => ({ ...prev, changelog: e.target.value }))}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none"
              placeholder="What changed in this release..."
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}