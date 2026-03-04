import { useRef, useEffect, useId } from 'react';
import { Link } from 'react-router-dom';
import { UploadCloud, Zap, FilePlus, BookOpen } from 'lucide-react';

export default function WelcomeModal({ onUpload, onNew, onRandom }) {
  const fileInputRef = useRef(null);
  const uploadButtonRef = useRef(null);
  const titleId = useId();

  useEffect(() => {
    // Focus the first interactive element for keyboard accessibility
    if (uploadButtonRef.current) {
      uploadButtonRef.current.focus();
    }
  }, []);

  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-slate-200">
        <div className="px-8 py-6 text-center">
          <h2 id={titleId} className="text-2xl font-bold text-slate-800 mb-2">Welcome to DepManager</h2>
          <p className="text-slate-500 mb-6">How would you like to start your session?</p>
          <div className="flex justify-center">
             <Link
                to="/guide"
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors mb-2"
              >
                <BookOpen className="w-4 h-4" />
                View Versioning Guide first
              </Link>
          </div>
        </div>

        {/* Hidden input moved outside for valid HTML */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={onUpload}
          className="hidden"
          accept=".json"
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-slate-200">
          {/* Option 1: Upload JSON */}
          <button
            ref={uploadButtonRef}
            onClick={handleUploadClick}
            className="flex flex-col items-center justify-center p-6 bg-white hover:bg-indigo-50 transition-colors text-center group focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
          >
            <div className="bg-indigo-100 p-3 rounded-full mb-3 group-hover:scale-110 transition-transform">
              <UploadCloud className="w-6 h-6 text-indigo-600" />
            </div>
            <h3 className="font-semibold text-slate-700 mb-1">Upload a Session</h3>
            <p className="text-xs text-slate-500">Load a .json file from a previous session.</p>
          </button>

          {/* Option 2: New/Empty Project */}
          <button
            onClick={onNew}
            className="flex flex-col items-center justify-center p-6 bg-white hover:bg-slate-50 transition-colors text-center group focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
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
            className="flex flex-col items-center justify-center p-6 bg-white hover:bg-amber-50 transition-colors text-center group focus:outline-none focus:ring-2 focus:ring-inset focus:ring-amber-500"
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
