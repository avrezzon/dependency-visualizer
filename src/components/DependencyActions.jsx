import { useState, useEffect } from 'react';
import { Save } from 'lucide-react';

export default function DependencyActions({
  selectedNode,
  allNodes,
  upstreamConnections,
  onUpdateDependencies,
}) {
  const [selectedDeps, setSelectedDeps] = useState(upstreamConnections);

  // When the selected node changes, reset the local state to match its dependencies
  useEffect(() => {
    setSelectedDeps(upstreamConnections);
  }, [upstreamConnections, selectedNode.id]);

  const handleCheckboxChange = (dependencyId) => {
    setSelectedDeps(prev =>
      prev.includes(dependencyId)
        ? prev.filter(id => id !== dependencyId)
        : [...prev, dependencyId]
    );
  };

  const handleUpdateClick = () => {
    onUpdateDependencies(selectedNode.id, selectedDeps);
  };

  // Cannot depend on itself
  const availableNodes = allNodes.filter(n => n.id !== selectedNode.id);

  return (
    <div className="mt-6 border-t border-slate-200 pt-6">
      <h3 className="text-xs uppercase text-slate-400 font-bold mb-3">
        Edit Dependencies
      </h3>
      <div className="space-y-3">
         <div className="border border-slate-200 rounded-lg max-h-48 overflow-y-auto p-2 space-y-1 bg-slate-50">
            {availableNodes.map(node => (
              <label key={node.id} className="flex items-center gap-2 p-2 hover:bg-slate-100 rounded cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedDeps.includes(node.id)}
                  onChange={() => handleCheckboxChange(node.id)}
                  className="rounded border-slate-400 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-sm text-slate-800">{node.label}</span>
                <span className="text-xs text-slate-400 ml-auto font-mono">({node.id})</span>
              </label>
            ))}
         </div>
        <button
          onClick={handleUpdateClick}
          className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-sm text-sm font-bold flex items-center justify-center gap-2 transition-colors"
        >
          <Save className="w-4 h-4" />
          Update Dependencies
        </button>
      </div>
    </div>
  );
}