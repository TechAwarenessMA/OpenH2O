import { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEcoData } from '../hooks/useEcoData';
import { Upload, FileJson, X, ArrowRight, Lock } from 'lucide-react';

export default function Landing() {
  const { uploadFile, hasData, sources } = useEcoData();
  const navigate = useNavigate();

  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);

  const handleFile = useCallback((file) => {
    setError(null);
    if (!file) return;
    if (!file.name.endsWith('.json') && !file.name.endsWith('.zip')) {
      setError('Please upload a .json or .zip file');
      return;
    }
    if (file.size > 500 * 1024 * 1024) { setError('File is too large (max 500 MB)'); return; }
    setSelectedFile(file);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    handleFile(e.dataTransfer.files[0]);
  }, [handleFile]);

  const handleSubmit = async () => {
    if (!selectedFile) return;
    await uploadFile(selectedFile);
    navigate('/processing');
  };

  const clearFile = () => {
    setSelectedFile(null);
    setError(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className="landing-split">

      {/* ── LEFT: HERO ─────────────────────────────────────── */}
      <section className="landing-left">
        <div className="landing-left-content">

          {/* Eyebrow */}
          <div className="landing-eyebrow">
            <span className="eyebrow-dot" />
            AI Environmental Impact Calculator
          </div>

          {/* Headline */}
          <h1 className="landing-headline">
            Every prompt<br />
            <span className="headline-accent">costs the planet.</span>
          </h1>

          <p className="landing-subline">
            Upload your AI conversation history from Claude or ChatGPT and discover
            the real energy, water, and carbon footprint of your AI use.
          </p>

          {/* Impact numbers */}
          <div className="impact-row">
            <div className="impact-stat">
              <span className="impact-num" style={{ color: '#FAC206' }}>0.003</span>
              <span className="impact-label">kWh per message</span>
            </div>
            <div className="impact-divider" />
            <div className="impact-stat">
              <span className="impact-num" style={{ color: '#16C0FF' }}>500ml</span>
              <span className="impact-label">water per session</span>
            </div>
            <div className="impact-divider" />
            <div className="impact-stat">
              <span className="impact-num" style={{ color: '#2ECC71' }}>1.5g</span>
              <span className="impact-label">CO₂ per response</span>
            </div>
          </div>

        </div>
      </section>

      {/* ── RIGHT: UPLOAD ──────────────────────────────────── */}
      <section className="landing-right">
        <div className="landing-right-content">

          <div className="upload-heading">
            <h2>See your actual footprint</h2>
            <p>Drop your <code>conversations.json</code> from Claude or ChatGPT — processed entirely in your browser.</p>
          </div>

          {/* Drop zone */}
          <div
            onDrop={handleDrop}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onClick={() => inputRef.current?.click()}
            className={`drop-zone ${dragOver ? 'drop-zone--active' : ''} ${selectedFile ? 'drop-zone--filled' : ''}`}
            role="button"
            tabIndex={0}
            aria-label="Upload conversations.json"
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click(); }}
          >
            <input
              ref={inputRef}
              type="file"
              accept=".json,.zip"
              className="hidden"
              onChange={(e) => handleFile(e.target.files[0])}
            />

            {selectedFile ? (
              <div className="drop-filled">
                <FileJson size={34} className="drop-icon-filled" />
                <div>
                  <p className="drop-filename">{selectedFile.name}</p>
                  <p className="drop-filesize">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB · ready to analyze</p>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); clearFile(); }}
                  className="drop-clear"
                  aria-label="Remove file"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <div className="drop-empty">
                <div className={`drop-icon-wrap ${dragOver ? 'drop-icon-wrap--active' : ''}`}>
                  <Upload size={26} />
                </div>
                <div>
                  <p className="drop-main-text">
                    {dragOver ? 'Release to upload' : 'Drop conversations.json or .zip here'}
                  </p>
                  <p className="drop-sub-text">or click to browse · .json or .zip · max 500 MB</p>
                </div>
              </div>
            )}
          </div>

          {error && (
            <div className="upload-error">{error}</div>
          )}

          {/* Analyze button */}
          {selectedFile ? (
            <button onClick={handleSubmit} className="analyze-btn">
              Analyze My Impact
              <ArrowRight size={20} />
            </button>
          ) : (
            <div className="how-to-export">
              <span>Don't have the file?</span>
              <span className="export-steps">
                <strong>Claude:</strong> claude.ai → Settings → Export Data<br />
                <strong>ChatGPT:</strong> chatgpt.com → Settings → Data Controls → Export
              </span>
            </div>
          )}

          {/* Privacy */}
          <div className="privacy-note">
            <Lock size={12} />
            Your data never leaves your device. Zero servers, zero storage.
          </div>

          {/* Already have data */}
          {hasData && (
            <div className="has-data-panel">
              <div>
                <p className="has-data-label">
                  {sources.map(s => s === 'claude' ? 'Claude' : 'ChatGPT').join(' + ')} loaded
                </p>
                <p className="has-data-sub">
                  {sources.length === 1
                    ? `Upload ${sources[0] === 'claude' ? 'ChatGPT' : 'Claude'} data too, or view your results.`
                    : 'Both sources combined. View your results.'}
                </p>
              </div>
              <button onClick={() => navigate('/dashboard')} className="has-data-btn">
                View Dashboard <ArrowRight size={14} />
              </button>
            </div>
          )}

        </div>
      </section>

    </div>
  );
}
