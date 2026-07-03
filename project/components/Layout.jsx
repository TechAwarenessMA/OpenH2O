import { useNavigate, useLocation } from 'react-router-dom';
import { useEcoData } from '../hooks/useEcoData';
import { C, F } from '../theme';

const NAV = [
  ['UPLOAD', '/'],
  ['IMPACT', '/dashboard'],
  ['BREAKDOWN', '/breakdown'],
  ['INSIGHTS', '/insights'],
  ['METHODOLOGY', '/methodology'],
  ['ABOUT', '/about'],
];

export default function Layout({ children, hasData }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { clearData } = useEcoData();

  const go = (to) => navigate(to);
  const reset = () => { clearData(); navigate('/'); };
  const isLanding = pathname === '/';

  return (
    <>
      {/* ══ NAV ══════════════════════════════════════════════ */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 50, background: C.paper,
        borderBottom: `2px solid ${C.ink}`, display: 'flex', alignItems: 'stretch',
        justifyContent: 'space-between', gap: '16px', padding: '0 clamp(16px,3vw,40px)',
        minHeight: '58px', flexWrap: 'wrap',
      }}>
        <button onClick={() => go('/')} style={{
          display: 'flex', alignItems: 'center', gap: '10px', background: 'transparent',
          border: 'none', cursor: 'pointer', padding: 0, color: C.ink,
        }}>
          <span style={{ fontFamily: F.anton, fontSize: '22px', letterSpacing: '0.01em', textTransform: 'uppercase' }}>OpenH2O</span>
          <span style={{ fontFamily: F.mono, fontSize: '9px', letterSpacing: '0.18em', color: C.muted }}>® BY TAA</span>
        </button>

        <nav style={{ display: 'flex', alignItems: 'stretch', flexWrap: 'wrap' }}>
          {NAV.map(([label, to]) => {
            const active = to === '/' ? isLanding : pathname === to;
            return (
              <button key={to} onClick={() => go(to)} className="oh-nav" style={{
                fontFamily: F.mono, fontSize: '10px', letterSpacing: '0.16em', textTransform: 'uppercase',
                padding: '0 clamp(8px,1.4vw,18px)',
                background: active ? C.ink : 'transparent',
                color: active ? C.paper : C.ink,
              }}>{label}</button>
            );
          })}
        </nav>

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          {hasData && (
            <>
              <span style={{ fontFamily: F.mono, fontSize: '9px', letterSpacing: '0.16em' }}>● DATA LIVE</span>
              <button onClick={reset} className="oh-out" style={{
                fontFamily: F.mono, fontSize: '9px', letterSpacing: '0.16em', padding: '5px 10px',
              }}>RESET</button>
            </>
          )}
        </div>
      </header>

      {children}

      {/* ══ FOOTER ═══════════════════════════════════════════ */}
      {!isLanding && (
        <footer style={{
          marginTop: 'auto', borderTop: `2px solid ${C.ink}`, padding: '18px clamp(16px,3vw,40px)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '14px', flexWrap: 'wrap',
        }}>
          <p style={{ fontFamily: F.mono, fontSize: '9px', letterSpacing: '0.14em', textTransform: 'uppercase', margin: 0, color: C.muted }}>
            OpenH2O — a free tool by{' '}
            <a href="https://www.techawarenessma.com" target="_blank" rel="noopener noreferrer"
              style={{ color: C.ink, textDecoration: 'underline', textUnderlineOffset: '2px' }}>Tech Awareness Association</a>, Shrewsbury MA
          </p>
          <div style={{ display: 'flex', gap: '20px' }}>
            <button onClick={() => go('/methodology')} className="oh-nav" style={{ fontFamily: F.mono, fontSize: '9px', letterSpacing: '0.16em', textTransform: 'uppercase' }}>Methodology</button>
            <button onClick={() => go('/about')} className="oh-nav" style={{ fontFamily: F.mono, fontSize: '9px', letterSpacing: '0.16em', textTransform: 'uppercase' }}>About</button>
          </div>
        </footer>
      )}
    </>
  );
}
