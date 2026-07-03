import { useNavigate } from 'react-router-dom';
import { C, F } from '../theme';

/** Shown on data screens (dashboard / breakdown / insights) before any upload. */
export default function EmptyState() {
  const navigate = useNavigate();
  return (
    <section data-screen-label="No data" style={{
      flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      gap: '22px', minHeight: '60vh', padding: '40px 20px', textAlign: 'center', animation: 'fadeUp 0.4s ease both',
    }}>
      <h2 style={{ fontFamily: F.anton, fontSize: 'clamp(44px,7vw,90px)', margin: 0, textTransform: 'uppercase', color: 'transparent', WebkitTextStroke: `2px ${C.ink}`, lineHeight: 1 }}>No data yet</h2>
      <p style={{ fontFamily: F.mono, fontSize: '11px', letterSpacing: '0.16em', textTransform: 'uppercase', margin: 0, color: C.muted }}>Upload your conversations.json to see your impact</p>
      <button onClick={() => navigate('/')} className="oh-solid" style={{ fontFamily: F.anton, fontSize: '16px', textTransform: 'uppercase', padding: '14px 28px' }}>Upload data →</button>
    </section>
  );
}
