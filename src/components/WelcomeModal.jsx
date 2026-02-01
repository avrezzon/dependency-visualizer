import { useRef } from 'react';
import { UploadCloud, Zap, FilePlus } from 'lucide-react';

export default function WelcomeModal({ onUpload, onNew, onRandom }) {
  const fileInputRef = useRef(null);

  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-slate-200">
        <div className="px-8 py-6 text-center">
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Welcome to DepManager</h2>
          <p className="text-slate-500 mb-8">How would you like to start your session?</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-slate-200">
          {/* Option 1: Upload JSON */}
          <button
            onClick={handleUploadClick}
            className="flex flex-col items-center justify-center p-6 bg-white hover:bg-indigo-50 transition-colors text-center group"
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={onUpload}
              className="hidden"
              accept=".json"
            />
            <div className="bg-indigo-100 p-3 rounded-full mb-3 group-hover:scale-110 transition-transform">
              <UploadCloud className="w-6 h-6 text-indigo-600" />
            </div>
            <h3 className="font-semibold text-slate-700 mb-1">Upload a Session</h3>
            <p className="text-xs text-slate-500">Load a .json file from a previous session.</p>
          </button>

          {/* Option 2: New/Empty Project */}
          <button
            onClick={onNew}
            className="flex flex-col items-center justify-center p-6 bg-white hover:bg-slate-50 transition-colors text-center group"
          >
            <div className="bg-slate-100 p-3 rounded-full mb-3 group-hover:scale-110 transition-transform">
              <FilePlus className="w-6 h-6 text-slate-600" />
            </div>
            <h3 className="font-semibold text-slate-700 mb-1">Start Fresh</h3>
            <p className="text-xs text-slate-500">Create a new, empty dependency visualization.</p>
          </button>

          {/* Option 3: Random Graph */}
          <button
            onClick={onRandom}
            className="flex flex-col items-center justify-center p-6 bg-white hover:bg-amber-50 transition-colors text-center group"
          >
            <div className="bg-amber-100 p-3 rounded-full mb-3 group-hover:scale-110 transition-transform">
              <Zap className="w-6 h-6 text-amber-600" />
            </div>
            <h3 className="font-semibold text-slate-700 mb-1">Generate Random</h3>
            <p className="text-xs text-slate-500">Create a random dependency tree to explore.</p>
          </button>
        </div>
      </div>
    </div>
  );
}
