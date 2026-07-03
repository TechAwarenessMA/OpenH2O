import { useNavigate } from 'react-router-dom';
import { C, F } from '../theme';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <section data-screen-label="Not found" style={{
      flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      gap: '22px', minHeight: '60vh', padding: '40px 20px', textAlign: 'center', animation: 'fadeUp 0.4s ease both',
    }}>
      <h1 style={{ fontFamily: F.anton, fontSize: 'clamp(64px,12vw,160px)', margin: 0, textTransform: 'uppercase', color: 'transparent', WebkitTextStroke: `2.5px ${C.ink}`, lineHeight: 1 }}>404</h1>
      <p style={{ fontFamily: F.mono, fontSize: '11px', letterSpacing: '0.16em', textTransform: 'uppercase', margin: 0, color: C.muted }}>The page you're looking for doesn't exist</p>
      <button onClick={() => navigate('/')} className="oh-solid" style={{ fontFamily: F.anton, fontSize: '16px', textTransform: 'uppercase', padding: '14px 28px' }}>Go home →</button>
    </section>
  );
}
