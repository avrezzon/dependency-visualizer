import { memo } from 'react';
import { Box, Database, Cpu, Activity, AlertCircle } from 'lucide-react';

const getIcon = (type) => {
  switch(type) {
    case 'core': return <Box className="w-5 h-5 text-blue-500" />;
    case 'repo': return <Database className="w-5 h-5 text-emerald-500" />;
    case 'app': return <Cpu className="w-5 h-5 text-purple-500" />;
    default: return <Activity className="w-5 h-5" />;
  }
};

const GraphNode = memo(({
  node,
  isSelected,
  isHighlighted,
  isOutdated,
  hasUpstream,
  hasDownstream,
  onSelect,
  onHover
}) => {
  return (
    <div
      data-testid={`node-${node.id}`}
      onClick={() => onSelect(node.id)}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect(node.id); } }}
      role="button"
      tabIndex={0}
      aria-label={`${node.label} version ${node.version}, ${node.category} dependency`}
      onMouseEnter={() => onHover(node.id)}
      onMouseLeave={() => onHover(null)}
      className={`
        relative p-4 rounded-lg border-2 transition-all cursor-pointer group
        ${isSelected
          ? 'border-indigo-500 bg-indigo-50 shadow-md ring-2 ring-indigo-200 ring-offset-1'
          : isOutdated
            ? 'border-amber-300 bg-amber-50 hover:border-amber-400'
            : 'border-slate-200 bg-white hover:border-indigo-300 hover:shadow-sm'
        }
        ${!isHighlighted ? 'opacity-30 blur-[1px] grayscale' : 'opacity-100'}
      `}
    >
      {/* Connecting Lines */}
      {hasUpstream && (
          <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-3 h-0.5 bg-slate-300" />
      )}
      {hasDownstream && (
          <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-3 h-0.5 bg-slate-300" />
      )}

      <div className="flex flex-col mb-2">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            {getIcon(node.type)}
            <span className="font-semibold text-sm">{node.label}</span>
          </div>
          {isOutdated && (
            <AlertCircle className="w-4 h-4 text-amber-500 animate-pulse" />
          )}
        </div>
        {(node.org || node.artifactId) && (
          <div className="mt-1 text-[10px] text-slate-500 font-mono pl-7">
            {node.org && <span>{node.org} / </span>}
            {node.artifactId && <span>{node.artifactId}</span>}
          </div>
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
});

GraphNode.displayName = 'GraphNode';

export default GraphNode;
