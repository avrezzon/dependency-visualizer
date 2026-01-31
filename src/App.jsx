import React, { useState, useMemo, useEffect } from 'react';
import { 
  GitBranch, 
  Box, 
  Layers, 
  ArrowRight, 
  AlertCircle, 
  CheckCircle, 
  Database, 
  Cpu, 
  BookOpen, 
  Activity,
  RefreshCw,
  Zap
} from 'lucide-react';

// --- Configuration & Initial Data ---

const INITIAL_NODES = [
  // Core
  { id: 'ext.models', label: 'ext.models', type: 'core', version: '1.0.0', category: 'Foundation' },
  { id: 'common', label: 'common-lib', type: 'core', version: '1.0.0', category: 'Foundation' },
  
  // Repositories
  { id: 'repo-a', label: 'Repo A', type: 'repo', version: '1.0.0', category: 'Data Access' },
  { id: 'repo-b', label: 'Repo B', type: 'repo', version: '1.0.0', category: 'Data Access' },
  { id: 'repo-c', label: 'Repo C', type: 'repo', version: '1.0.0', category: 'Data Access' },
  { id: 'repo-d', label: 'Repo D', type: 'repo', version: '1.0.0', category: 'Data Access' },
  { id: 'repo-e', label: 'Repo E', type: 'repo', version: '1.0.0', category: 'Data Access' },
  
  // Readers
  { id: 'reader-a', label: 'Reader A', type: 'app', version: '2.1.0', category: 'Readers' },
  { id: 'reader-b', label: 'Reader B', type: 'app', version: '2.0.4', category: 'Readers' },
  { id: 'reader-c', label: 'Reader C', type: 'app', version: '2.1.1', category: 'Readers' },

  // Processors (Assumed dependencies based on prompt pattern)
  { id: 'proc-a', label: 'Processor A', type: 'app', version: '1.5.0', category: 'Processors' },
  { id: 'proc-b', label: 'Processor B', type: 'app', version: '1.2.0', category: 'Processors' },
];

const INITIAL_EDGES = [
  // Chain: ext.models -> common
  { source: 'ext.models', target: 'common' },
  
  // Common -> Apps
  { source: 'common', target: 'reader-a' },
  { source: 'common', target: 'reader-b' },
  { source: 'common', target: 'reader-c' },
  { source: 'common', target: 'proc-a' },
  { source: 'common', target: 'proc-b' },

  // Repos -> Reader A (A, C, D)
  { source: 'repo-a', target: 'reader-a' },
  { source: 'repo-c', target: 'reader-a' },
  { source: 'repo-d', target: 'reader-a' },

  // Repos -> Reader B (B, C, E)
  { source: 'repo-b', target: 'reader-b' },
  { source: 'repo-c', target: 'reader-b' },
  { source: 'repo-e', target: 'reader-b' },

  // Repos -> Reader C (A, D, E)
  { source: 'repo-a', target: 'reader-c' },
  { source: 'repo-d', target: 'reader-c' },
  { source: 'repo-e', target: 'reader-c' },

  // Repos -> Processor A (Simulated: A, B)
  { source: 'repo-a', target: 'proc-a' },
  { source: 'repo-b', target: 'proc-a' },

  // Repos -> Processor B (Simulated: C, D)
  { source: 'repo-c', target: 'proc-b' },
  { source: 'repo-d', target: 'proc-b' },
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

const bumpString = (ver, type) => {
  const [major, minor, patch] = ver.split('.').map(Number);
  if (type === 'major') return `${major + 1}.0.0`;
  if (type === 'minor') return `${major}.${minor + 1}.0`;
  return `${major}.${minor}.${patch + 1}`;
};

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

export default function App() {
  const [nodes, setNodes] = useState(INITIAL_NODES);
  const [selectedNode, setSelectedNode] = useState(null);
  const [hoveredNode, setHoveredNode] = useState(null);
  
  // Track which dependencies the apps are currently "using". 
  // In a real app, this would be in a lockfile. Here, we simulate that apps store 
  // a record of what version of a dependency they are built against.
  const [appDependencies, setAppDependencies] = useState(() => {
    const deps = {};
    INITIAL_NODES.forEach(n => {
      if (n.type === 'app') {
        deps[n.id] = {};
        // Initialize apps to use the current version of their upstream dependencies
        INITIAL_EDGES.filter(e => e.target === n.id).forEach(e => {
          const upstreamNode = INITIAL_NODES.find(un => un.id === e.source);
          if (upstreamNode) {
            deps[n.id][upstreamNode.id] = upstreamNode.version;
          }
        });
      }
    });
    return deps;
  });

  // Calculate connections
  const connections = useMemo(() => {
    const downstream = {}; // Key: Source, Value: [Targets]
    const upstream = {};   // Key: Target, Value: [Sources]
    
    INITIAL_EDGES.forEach(({ source, target }) => {
      if (!downstream[source]) downstream[source] = [];
      downstream[source].push(target);
      
      if (!upstream[target]) upstream[target] = [];
      upstream[target].push(source);
    });
    return { downstream, upstream };
  }, []);

  // Determine which apps are outdated
  const statusMap = useMemo(() => {
    const status = {};
    nodes.forEach(node => {
      if (node.type === 'app') {
        const myDeps = appDependencies[node.id] || {};
        const outliers = [];
        
        Object.entries(myDeps).forEach(([depId, recordedVersion]) => {
          const actualDep = nodes.find(n => n.id === depId);
          if (actualDep && actualDep.version !== recordedVersion) {
            outliers.push({
              name: actualDep.label,
              current: actualDep.version,
              using: recordedVersion
            });
          }
        });
        
        status[node.id] = {
          isOutdated: outliers.length > 0,
          outliers
        };
      } else {
        status[node.id] = { isOutdated: false, outliers: [] };
      }
    });
    return status;
  }, [nodes, appDependencies]);

  // Handle version bump
  const handleBump = (nodeId, type) => {
    setNodes(prev => prev.map(n => {
      if (n.id === nodeId) {
        return { ...n, version: bumpString(n.version, type) };
      }
      return n;
    }));
  };

  // Handle "Updating" an app (rebuilding it with latest deps)
  const handleUpdateApp = (appId) => {
    setAppDependencies(prev => {
      const newDeps = { ...prev };
      newDeps[appId] = {};
      
      // Look up all sources for this app
      const sources = connections.upstream[appId] || [];
      sources.forEach(sourceId => {
        const sourceNode = nodes.find(n => n.id === sourceId);
        if (sourceNode) {
          newDeps[appId][sourceId] = sourceNode.version;
        }
      });
      return newDeps;
    });
    
    // Also bump the app version itself because its code changed
    handleBump(appId, 'patch');
  };

  // Helper to check if a node is in the dependency chain of the hovered/selected node
  const isRelated = (targetId) => {
    const rootId = hoveredNode || selectedNode;
    if (!rootId) return false;
    if (rootId === targetId) return true;

    // Check direct or indirect connections
    // Simple BFS for upstream/downstream relative to root
    const checkDeep = (start, direction) => {
      const queue = [start];
      const visited = new Set();
      while (queue.length > 0) {
        const current = queue.shift();
        if (current === targetId) return true;
        if (!visited.has(current)) {
          visited.add(current);
          const neighbors = connections[direction][current] || [];
          queue.push(...neighbors);
        }
      }
      return false;
    };

    return checkDeep(rootId, 'downstream') || checkDeep(rootId, 'upstream');
  };

  const categories = ['Foundation', 'Data Access', 'Readers', 'Processors'];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2 text-slate-800">
              <Layers className="text-indigo-600" />
              DepManager <span className="text-slate-400 font-light">Microservice Version Control</span>
            </h1>
            <p className="text-slate-500 mt-1">Visualize dependency chains and manage release consistency.</p>
          </div>
          <div className="flex gap-2 text-sm text-slate-600 bg-white px-4 py-2 rounded-lg shadow-sm border border-slate-200">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-slate-300"></span> Stable
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span> Outdated Deps
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-500"></span> Selected
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Main Visualization Board */}
          <Card className="lg:col-span-3 p-6 min-h-[600px] overflow-x-auto">
            <div className="flex justify-between min-w-[800px] h-full gap-8">
              {categories.map((cat, idx) => (
                <div key={cat} className="flex-1 flex flex-col gap-4 relative">
                  <div className="text-xs uppercase tracking-wider font-semibold text-slate-400 border-b border-slate-200 pb-2 mb-2">
                    {cat}
                  </div>
                  
                  {nodes.filter(n => n.category === cat).map(node => {
                    const isHighlighted = (hoveredNode || selectedNode) ? isRelated(node.id) : true;
                    const isSelected = selectedNode === node.id;
                    const status = statusMap[node.id];
                    
                    return (
                      <div
                        key={node.id}
                        data-testid={`node-${node.id}`}
                        onClick={() => setSelectedNode(node.id)}
                        onMouseEnter={() => setHoveredNode(node.id)}
                        onMouseLeave={() => setHoveredNode(null)}
                        className={`
                          relative p-4 rounded-lg border-2 transition-all cursor-pointer group
                          ${isSelected 
                            ? 'border-indigo-500 bg-indigo-50 shadow-md ring-2 ring-indigo-200 ring-offset-1' 
                            : status.isOutdated
                              ? 'border-amber-300 bg-amber-50 hover:border-amber-400'
                              : 'border-slate-200 bg-white hover:border-indigo-300 hover:shadow-sm'
                          }
                          ${!isHighlighted ? 'opacity-30 blur-[1px] grayscale' : 'opacity-100'}
                        `}
                      >
                        {/* Connecting Lines (Simplified for visual reference only) */}
                        {connections.upstream[node.id] && (
                           <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-3 h-0.5 bg-slate-300" />
                        )}
                        {connections.downstream[node.id] && (
                           <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-3 h-0.5 bg-slate-300" />
                        )}

                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-2">
                            {getIcon(node.type)}
                            <span className="font-semibold text-sm">{node.label}</span>
                          </div>
                          {status.isOutdated && (
                            <AlertCircle className="w-4 h-4 text-amber-500 animate-pulse" />
                          )}
                        </div>
                        
                        <div className="flex items-center justify-between mt-3">
                          <code className="text-xs font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">
                            v{node.version}
                          </code>
                          <span className="text-[10px] text-slate-400 uppercase font-bold">{node.id}</span>
                        </div>
                      </div>
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
                  const status = statusMap[node.id];
                  const upstream = connections.upstream[node.id] || [];
                  const downstream = connections.downstream[node.id] || [];

                  return (
                    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                      <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-100">
                        <div>
                          <h2 className="text-xl font-bold text-slate-800">{node.label}</h2>
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
                        <div className="text-sm font-medium text-slate-700">Release Management</div>
                        <div className="grid grid-cols-3 gap-2">
                          <button 
                            onClick={() => handleBump(node.id, 'patch')}
                            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition-colors"
                          >
                            Patch
                          </button>
                          <button 
                            onClick={() => handleBump(node.id, 'minor')}
                            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition-colors"
                          >
                            Minor
                          </button>
                          <button 
                            onClick={() => handleBump(node.id, 'major')}
                            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition-colors"
                          >
                            Major
                          </button>
                        </div>
                        
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
                              onClick={() => handleUpdateApp(node.id)}
                              className="w-full py-2 bg-amber-500 hover:bg-amber-600 text-white rounded shadow-sm text-xs font-bold flex items-center justify-center gap-2 transition-colors"
                            >
                              <RefreshCw className="w-3 h-3" />
                              Rebuild & Bump App
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Dependency Lists */}
                      <div className="space-y-6">
                        {/* Upstream */}
                        <div>
                          <h3 className="text-xs uppercase text-slate-400 font-bold mb-3 flex items-center gap-2">
                            <ArrowRight className="w-3 h-3 rotate-180" /> Requires ({upstream.length})
                          </h3>
                          {upstream.length === 0 ? (
                            <p className="text-xs text-slate-400 italic">No upstream dependencies</p>
                          ) : (
                            <div className="space-y-2">
                              {upstream.map(uid => {
                                const upNode = nodes.find(n => n.id === uid);
                                return (
                                  <div key={uid} onClick={() => setSelectedNode(uid)} className="flex items-center justify-between p-2 bg-slate-50 rounded hover:bg-slate-100 cursor-pointer border border-transparent hover:border-slate-200 group">
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
                                const downNode = nodes.find(n => n.id === did);
                                return (
                                  <div key={did} onClick={() => setSelectedNode(did)} className="flex items-center justify-between p-2 bg-slate-50 rounded hover:bg-slate-100 cursor-pointer border border-transparent hover:border-slate-200 group">
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
    </div>
  );
}