import { C, F, sectionNarrow } from '../theme';

const DOES = [
  'Estimates the energy, water, and carbon footprint of your Claude and ChatGPT conversations',
  'Processes everything locally in your browser — your data never leaves your device',
  'Provides real-world comparisons to contextualize your impact',
  'Offers actionable tips for reducing your AI environmental footprint',
  'Explains the methodology transparently with full source citations',
];

const PRIVACY = [
  '■ No data sent to any server',
  '■ No cookies or tracking',
  '■ No accounts required',
  '■ Conversations stay on your device',
  '■ Closing the tab erases all data',
];

const eyebrow = { fontFamily: F.mono, fontSize: '10px', letterSpacing: '0.18em', textTransform: 'uppercase', margin: '0 0 16px' };

export default function About() {
  return (
    <section data-screen-label="About" style={{ ...sectionNarrow, gap: 'clamp(32px,4vw,52px)' }}>
      <div>
        <h1 style={{ fontFamily: F.anton, fontSize: 'clamp(48px,7vw,96px)', margin: 0, textTransform: 'uppercase', lineHeight: 0.95 }}>
          About <span style={{ color: 'transparent', WebkitTextStroke: `2px ${C.ink}` }}>OpenH2O</span>
        </h1>
        <p style={{ fontFamily: F.mono, fontSize: '10px', letterSpacing: '0.14em', textTransform: 'uppercase', margin: '14px 0 0', color: C.muted }}>Understanding your AI environmental footprint</p>
      </div>

      {/* Mission */}
      <div style={{ borderTop: `2px solid ${C.ink}`, paddingTop: '24px' }}>
        <p style={eyebrow}>(01) — Our mission</p>
        <p style={{ fontSize: 'clamp(17px,1.8vw,22px)', lineHeight: 1.55, margin: 0, fontWeight: 500, maxWidth: '760px' }}>OpenH2O is built by the <strong>Tech Awareness Association</strong> (TAA), a student-founded nonprofit dedicated to promoting technology literacy and digital responsibility.</p>
        <p style={{ fontSize: '15px', lineHeight: 1.6, margin: '18px 0 0', color: C.body, fontWeight: 500, maxWidth: '720px' }}>As AI becomes an everyday tool, understanding its environmental cost is crucial. OpenH2O makes this invisible impact visible — empowering users to make more informed choices about their AI usage.</p>
      </div>

      {/* What it does */}
      <div style={{ borderTop: `2px solid ${C.ink}`, paddingTop: '24px' }}>
        <p style={eyebrow}>(02) — What OpenH2O does</p>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {DOES.map((d, i) => (
            <p key={i} style={{ display: 'flex', gap: '14px', margin: 0, padding: '12px 0', borderBottom: `1px solid ${C.hairSoft}`, fontSize: '14.5px', fontWeight: 500 }}>
              <span style={{ fontFamily: F.mono }}>—</span><span>{d}</span>
            </p>
          ))}
        </div>
      </div>

      {/* Privacy */}
      <div style={{ background: C.ink, color: C.paper, padding: 'clamp(24px,3vw,40px)' }}>
        <p style={{ fontFamily: F.mono, fontSize: '10px', letterSpacing: '0.18em', textTransform: 'uppercase', margin: '0 0 16px', opacity: 0.6 }}>(03) — Privacy first</p>
        <p style={{ fontSize: '15px', margin: '0 0 16px', fontWeight: 500 }}>OpenH2O is a fully client-side application. This means:</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px,1fr))', gap: '12px 28px', fontFamily: F.mono, fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase', lineHeight: 1.8 }}>
          {PRIVACY.map((p, i) => <span key={i}>{p}</span>)}
        </div>
      </div>

      {/* Links */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px,1fr))', gap: '20px' }}>
        <a href="https://www.techawarenessma.com" target="_blank" rel="noopener noreferrer" className="oh-cardlink" style={{ padding: '22px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
          <span>
            <span style={{ fontFamily: F.mono, fontSize: '11px', letterSpacing: '0.16em', textTransform: 'uppercase', fontWeight: 600, display: 'block' }}>TAA Website</span>
            <span style={{ fontSize: '12px', opacity: 0.6, display: 'block', marginTop: '4px' }}>techawarenessma.com</span>
          </span>
          <span style={{ fontFamily: F.anton, fontSize: '24px' }}>↗</span>
        </a>
        <a href="https://github.com/TechAwarenessMA/OpenH2O" target="_blank" rel="noopener noreferrer" className="oh-cardlink" style={{ padding: '22px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
          <span>
            <span style={{ fontFamily: F.mono, fontSize: '11px', letterSpacing: '0.16em', textTransform: 'uppercase', fontWeight: 600, display: 'block' }}>GitHub</span>
            <span style={{ fontSize: '12px', opacity: 0.6, display: 'block', marginTop: '4px' }}>View source code</span>
          </span>
          <span style={{ fontFamily: F.anton, fontSize: '24px' }}>↗</span>
        </a>
      </div>

      <div style={{ border: `2px solid ${C.ink}`, padding: '28px', textAlign: 'center' }}>
        <p style={{ fontFamily: F.anton, fontSize: 'clamp(18px,2vw,26px)', margin: 0, textTransform: 'uppercase' }}>A free tool by Tech Awareness Association</p>
        <p style={{ fontFamily: F.mono, fontSize: '9px', letterSpacing: '0.18em', textTransform: 'uppercase', margin: '10px 0 0', color: C.muted }}>Student-founded nonprofit · Shrewsbury, MA</p>
      </div>
    </section>
  );
}
