import { useState, useRef, useCallback } from 'react';
import { Upload, FileJson, X } from 'lucide-react';

export default function UploadZone({ onUpload }) {
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);

  const handleFile = useCallback((file) => {
    setError(null);
    if (!file) return;
    if (!file.name.endsWith('.json')) {
      setError('Please upload a .json file');
      return;
    }
    if (file.size > 500 * 1024 * 1024) {
      setError('File is too large (max 500MB)');
      return;
    }
    setSelectedFile(file);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    handleFile(file);
  }, [handleFile]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOver(false);
  }, []);

  const handleSubmit = () => {
    if (selectedFile) {
      onUpload(selectedFile);
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    setError(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => inputRef.current?.click()}
        className={`border-4 border-dashed p-10 text-center cursor-pointer transition-all ${
          dragOver
            ? 'border-green bg-green/10'
            : 'border-navy/30 bg-white hover:border-navy hover:bg-cream'
        }`}
        role="button"
        tabIndex={0}
        aria-label="Upload conversations.json file"
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click(); }}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".json"
          className="hidden"
          onChange={(e) => handleFile(e.target.files[0])}
        />

        {selectedFile ? (
          <div className="flex flex-col items-center gap-3">
            <FileJson size={40} className="text-green" />
            <div>
              <p className="font-black text-navy text-sm">{selectedFile.name}</p>
              <p className="text-xs text-slate font-bold">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); clearFile(); }}
              className="flex items-center gap-1 text-xs text-coral font-black uppercase tracking-wider hover:underline"
            >
              <X size={14} /> Remove
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <Upload size={40} className={dragOver ? 'text-green' : 'text-navy/40'} />
            <div>
              <p className="font-black text-navy text-sm">
                {dragOver ? 'Drop it here!' : 'Drop your conversations.json here'}
              </p>
              <p className="text-xs text-slate font-bold mt-1">or click to browse</p>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="p-3 border-4 border-coral bg-coral/10">
          <p className="text-sm text-coral font-black">{error}</p>
        </div>
      )}

      {/* Submit button */}
      {selectedFile && (
        <button
          onClick={handleSubmit}
          className="w-full py-4 bg-green text-white font-black text-lg uppercase tracking-wider border-4 border-green hover:bg-green/90 transition-colors animate-fade-in-up"
        >
          Analyze My Impact
        </button>
      )}

      {/* Privacy reminder */}
      <p className="text-xs text-slate font-bold text-center">
        Your data stays in your browser. Nothing is uploaded to any server.
      </p>
    </div>
  );
}
