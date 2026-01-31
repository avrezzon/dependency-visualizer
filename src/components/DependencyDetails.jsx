import {
  ArrowLeft,
  Clock,
  GitCommit,
  FileText,
  ExternalLink,
  Box,
  Database,
  Cpu,
  Activity,
  ArrowRight
} from 'lucide-react';

const getIcon = (type) => {
  switch(type) {
    case 'core': return <Box className="w-5 h-5 text-blue-500" />;
    case 'repo': return <Database className="w-5 h-5 text-emerald-500" />;
    case 'app': return <Cpu className="w-5 h-5 text-purple-500" />;
    default: return <Activity className="w-5 h-5" />;
  }
};

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

export default function DependencyDetails({ node, onBack, upstreamIds, downstreamIds, nodesMap, onNodeSelect }) {
  // Sort history by date descending, take last 5
  const history = [...(node.history || [])].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* Header */}
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-slate-100 rounded-lg">
                {getIcon(node.type)}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-800">{node.label}</h1>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-1">
                  <Badge color="blue">{node.category}</Badge>
                  <span className="text-slate-400 text-sm font-mono">{node.id}</span>
                  {(node.org || node.artifactId) && (
                    <div className="flex items-center gap-3 text-sm text-slate-500">
                      {node.org && (
                        <span className="flex items-center gap-1">
                          <span className="font-semibold">Org:</span> {node.org}
                        </span>
                      )}
                      {node.artifactId && (
                        <span className="flex items-center gap-1">
                          <span className="font-semibold">Artifact:</span> {node.artifactId}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-slate-500 mb-1">Current Version</div>
              <div className="text-3xl font-mono font-bold text-indigo-600">v{node.version}</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* Left Column: Relationships */}
          <div className="md:col-span-1 space-y-6">

            {/* Upstream */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
              <h3 className="text-xs uppercase text-slate-400 font-bold mb-4 flex items-center gap-2">
                <ArrowRight className="w-3 h-3 rotate-180" /> Requires ({upstreamIds.length})
              </h3>
              {upstreamIds.length === 0 ? (
                <p className="text-sm text-slate-400 italic">No upstream dependencies</p>
              ) : (
                <div className="space-y-3">
                  {upstreamIds.map(uid => {
                    const upNode = nodesMap.get(uid);
                    if (!upNode) return null;
                    return (
                      <div
                        key={uid}
                        onClick={() => onNodeSelect(uid)}
                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onNodeSelect(uid); } }}
                        role="button"
                        tabIndex={0}
                        className="group flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-transparent hover:border-slate-200 cursor-pointer transition-colors hover:bg-slate-100"
                      >
                        <div className="flex items-center gap-3">
                          {getIcon(upNode.type)}
                          <span className="text-sm font-medium text-slate-700 group-hover:text-indigo-600">{upNode.label}</span>
                        </div>
                        <Badge>v{upNode.version}</Badge>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Downstream */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
              <h3 className="text-xs uppercase text-slate-400 font-bold mb-4 flex items-center gap-2">
                <ArrowRight className="w-3 h-3" /> Used By ({downstreamIds.length})
              </h3>
              {downstreamIds.length === 0 ? (
                <p className="text-sm text-slate-400 italic">No downstream consumers</p>
              ) : (
                <div className="space-y-3">
                  {downstreamIds.map(did => {
                    const downNode = nodesMap.get(did);
                    if (!downNode) return null;
                    return (
                      <div
                        key={did}
                        onClick={() => onNodeSelect(did)}
                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onNodeSelect(did); } }}
                        role="button"
                        tabIndex={0}
                        className="group flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-transparent hover:border-slate-200 cursor-pointer transition-colors hover:bg-slate-100"
                      >
                        <div className="flex items-center gap-3">
                          {getIcon(downNode.type)}
                          <span className="text-sm font-medium text-slate-700 group-hover:text-indigo-600">{downNode.label}</span>
                        </div>
                        <Badge>v{downNode.version}</Badge>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

          </div>

          {/* Right Column: History */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 h-full">
              <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                <Clock className="w-5 h-5 text-indigo-500" />
                Version History
              </h2>

              {history.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <GitCommit className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p>No version history recorded yet.</p>
                </div>
              ) : (
                <div className="relative border-l-2 border-slate-100 ml-3 space-y-8 pl-8 py-2">
                  {history.map((release, index) => (
                    <div key={index} className="relative">
                      {/* Timeline Dot */}
                      <span className="absolute -left-[41px] top-1 w-5 h-5 rounded-full border-4 border-white bg-indigo-500 ring-1 ring-slate-200"></span>

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-3">
                          <span className="text-xl font-bold text-slate-800">v{release.version}</span>
                          <span className="text-xs text-slate-500 flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-full border border-slate-100">
                            <Clock className="w-3 h-3" />
                            {new Date(release.date).toLocaleDateString()}
                          </span>
                        </div>
                        {release.prLink && (
                          <a
                            href={release.prLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-800 hover:underline"
                          >
                            <ExternalLink className="w-3 h-3" />
                            View PR
                          </a>
                        )}
                      </div>

                      <div className="bg-slate-50 rounded-lg p-4 border border-slate-100">
                         <div className="flex items-start gap-2 text-slate-600">
                           <FileText className="w-4 h-4 mt-1 text-slate-400" />
                           <p className="text-sm whitespace-pre-wrap">{release.changelog || "No changelog provided."}</p>
                         </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
