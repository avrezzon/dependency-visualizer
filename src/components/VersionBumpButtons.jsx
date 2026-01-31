import { bumpString } from '../utils/versioning';

  const VersionBumpButtons = ({ node, handleBump }) => {
    return (
      <div className="grid grid-cols-3 gap-2">
        {['major', 'minor', 'patch'].map(type => {
          const nextVersion = bumpString(node.version, type);
          return (
            <button
              key={type}
              onClick={() => handleBump(node.id, type)}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition-colors flex flex-col items-center"
              title={`Perform a ${type} version increment (${node.version} -> ${nextVersion})`}
            >
              <span>{type.charAt(0).toUpperCase() + type.slice(1)}</span>
              <span className="font-mono text-indigo-600 text-[10px]">v{nextVersion}</span>
            </button>
          );
        })}
      </div>
    );
  };

  export default VersionBumpButtons;
