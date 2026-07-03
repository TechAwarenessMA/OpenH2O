import { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEcoData } from '../hooks/useEcoData';
import { C, F } from '../theme';

const HERO_STATS = [
  ['0.003', 'kWh per message'],
  ['500ml', 'water per session'],
  ['1.5g', 'CO₂ per response'],
];

export default function Landing() {
  const { uploadFile, loadSample, hasData, sources } = useEcoData();
  const navigate = useNavigate();

  const [drag, setDrag] = useState(false);
  const [file, setFile] = useState(null);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);

  const handleFile = useCallback((f) => {
    setError(null);
    if (!f) return;
    if (!f.name.endsWith('.json') && !f.name.endsWith('.zip')) {
      setError('Please upload a .json or .zip file'); return;
    }
    if (f.size > 500 * 1024 * 1024) { setError('File is too large (max 500 MB)'); return; }
    setFile(f);
  }, []);

  const analyze = () => {
    if (!file) return;
    navigate('/processing');
    uploadFile(file);
  };

  const sample = () => {
    navigate('/processing');
    loadSample();
  };

  const clearFile = (e) => {
    e.stopPropagation();
    setFile(null); setError(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <section data-screen-label="Landing" style={{ animation: 'fadeUp 0.5s ease both' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.55fr) minmax(340px,1fr)', borderBottom: `2px solid ${C.ink}` }} className="oh-landing-grid">

        {/* ── Hero ─────────────────────────────────────────── */}
        <div style={{ padding: 'clamp(28px,5vw,72px) clamp(20px,4vw,64px)', display: 'flex', flexDirection: 'column', gap: '28px', minHeight: '60vh' }}>
          <p style={{ fontFamily: F.mono, fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase', margin: 0, color: C.ink }}>(01) — AI Environmental Impact Calculator</p>
          <h1 style={{ fontFamily: F.anton, fontSize: 'clamp(52px,8.2vw,142px)', lineHeight: 0.96, margin: 0, textTransform: 'uppercase', letterSpacing: '0.005em' }}>
            Every prompt<br />
            <span style={{ color: 'transparent', WebkitTextStroke: `2.5px ${C.ink}` }}>costs the</span><br />
            planet.
          </h1>
          <p style={{ fontSize: '16px', lineHeight: 1.55, maxWidth: '520px', margin: 0, color: C.body, fontWeight: 500 }}>
            Upload your AI conversation history from Claude or ChatGPT and discover the real energy, water, and carbon footprint of your AI use.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0,1fr))', gap: 0, marginTop: 'auto', borderTop: `1px solid ${C.hair}` }}>
            {HERO_STATS.map(([num, label], i) => (
              <div key={label} style={{ padding: i === 0 ? '18px 18px 0 0' : i === 2 ? '18px 0 0 18px' : '18px 18px 0 18px', borderLeft: i === 0 ? 'none' : `1px solid ${C.hair}` }}>
                <span style={{ fontFamily: F.anton, fontSize: 'clamp(24px,2.6vw,40px)', display: 'block' }}>{num}</span>
                <span style={{ fontFamily: F.mono, fontSize: '9px', letterSpacing: '0.16em', textTransform: 'uppercase', color: C.muted }}>{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Upload column ────────────────────────────────── */}
        <div style={{ borderLeft: `2px solid ${C.ink}`, padding: 'clamp(24px,3vw,44px) clamp(20px,2.5vw,36px)', display: 'flex', flexDirection: 'column', gap: '18px' }} className="oh-upload-col">
          <p style={{ fontFamily: F.mono, fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase', margin: 0 }}>(02) — Upload</p>
          <h2 style={{ fontFamily: F.anton, fontSize: 'clamp(24px,2.4vw,34px)', margin: 0, textTransform: 'uppercase', lineHeight: 1.05 }}>See your actual footprint</h2>
          <p style={{ fontSize: '13.5px', lineHeight: 1.55, margin: 0, color: C.body, fontWeight: 500 }}>
            Drop your <span style={{ fontFamily: F.mono, fontSize: '12px', background: C.panel, padding: '1px 5px' }}>conversations.json</span> from Claude or ChatGPT — processed entirely in your browser.
          </p>

          <input type="file" accept=".json,.zip" ref={inputRef} onChange={(e) => handleFile(e.target.files && e.target.files[0])} style={{ display: 'none' }} />

          <div
            onClick={() => inputRef.current && inputRef.current.click()}
            onDrop={(e) => { e.preventDefault(); setDrag(false); handleFile(e.dataTransfer.files[0]); }}
            onDragOver={(e) => { e.preventDefault(); if (!drag) setDrag(true); }}
            onDragLeave={() => setDrag(false)}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') inputRef.current && inputRef.current.click(); }}
            role="button" tabIndex={0}
            style={{
              border: `2px solid ${C.ink}`, minHeight: '190px', display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: '12px', textAlign: 'center', cursor: 'pointer',
              padding: '24px', background: drag ? C.ink : 'transparent', color: drag ? C.paper : C.ink,
            }}
          >
            {!file ? (
              <>
                <span style={{ fontFamily: F.anton, fontSize: '44px', lineHeight: 1 }}>↓</span>
                <span style={{ fontFamily: F.mono, fontSize: '11px', letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 600 }}>
                  {drag ? 'RELEASE TO UPLOAD' : 'DROP CONVERSATIONS.JSON HERE'}
                </span>
                <span style={{ fontFamily: F.mono, fontSize: '9px', letterSpacing: '0.12em', textTransform: 'uppercase', opacity: 0.55 }}>or click to browse · .json / .zip · max 500 MB</span>
              </>
            ) : (
              <>
                <span style={{ fontFamily: F.mono, fontSize: '12px', letterSpacing: '0.06em', fontWeight: 600, wordBreak: 'break-all' }}>{file.name}</span>
                <span style={{ fontFamily: F.mono, fontSize: '10px', letterSpacing: '0.12em', textTransform: 'uppercase', opacity: 0.6 }}>{(file.size / 1024 / 1024).toFixed(2)} MB · ready to analyze</span>
                <button onClick={clearFile} style={{ fontFamily: F.mono, fontSize: '9px', letterSpacing: '0.16em', background: 'transparent', border: '1px solid currentColor', color: 'inherit', padding: '5px 12px', cursor: 'pointer', textTransform: 'uppercase' }}>× Remove</button>
              </>
            )}
          </div>

          {error && (
            <p style={{ fontFamily: F.mono, fontSize: '11px', letterSpacing: '0.08em', margin: 0, border: `1px solid ${C.ink}`, padding: '10px 12px', background: C.ink, color: C.paper }}>! {error}</p>
          )}

          {file ? (
            <button onClick={analyze} className="oh-solid" style={{ fontFamily: F.anton, fontSize: '18px', textTransform: 'uppercase', letterSpacing: '0.03em', padding: '16px 20px', width: '100%' }}>Analyze my impact →</button>
          ) : (
            <div style={{ borderTop: `1px solid ${C.hair}`, paddingTop: '14px', fontFamily: F.mono, fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase', lineHeight: 2, color: C.body }}>
              Don't have the file?<br />
              <span style={{ color: C.ink, fontWeight: 600 }}>Claude</span> &nbsp;claude.ai → Settings → Export Data<br />
              <span style={{ color: C.ink, fontWeight: 600 }}>ChatGPT</span> &nbsp;Settings → Data Controls → Export
            </div>
          )}

          <button onClick={sample} className="oh-textlink" style={{ fontFamily: F.mono, fontSize: '10px', letterSpacing: '0.16em', textTransform: 'uppercase', textAlign: 'left' }}>Or explore with sample data →</button>

          {hasData && (
            <div style={{ background: C.ink, color: C.paper, padding: '16px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
              <span style={{ fontFamily: F.mono, fontSize: '10px', letterSpacing: '0.14em', textTransform: 'uppercase' }}>● {sources.map(x => x === 'claude' ? 'CLAUDE' : 'CHATGPT').join(' + ')} data loaded</span>
              <button onClick={() => navigate('/dashboard')} style={{ fontFamily: F.mono, fontSize: '10px', letterSpacing: '0.14em', textTransform: 'uppercase', background: C.paper, color: C.ink, border: 'none', padding: '8px 14px', cursor: 'pointer', fontWeight: 600 }}>View dashboard →</button>
            </div>
          )}

          <p style={{ fontFamily: F.mono, fontSize: '9px', letterSpacing: '0.14em', textTransform: 'uppercase', margin: 'auto 0 0', color: C.muted, lineHeight: 1.8 }}>■ Your data never leaves your device.<br />Zero servers. Zero storage.</p>
        </div>
      </div>

      {/* Giant footer wordmark */}
      <div style={{ overflow: 'hidden', padding: 'clamp(20px,3vw,48px) 0 0', textAlign: 'center' }}>
        <div style={{ fontFamily: F.anton, fontSize: 'clamp(80px,16.5vw,260px)', lineHeight: 0.85, textTransform: 'uppercase', whiteSpace: 'nowrap', letterSpacing: '0.005em', transform: 'translateY(6%)' }}>
          OPEN<span style={{ color: 'transparent', WebkitTextStroke: `3px ${C.ink}` }}>H2O</span>
        </div>
      </div>
    </section>
  );
}
