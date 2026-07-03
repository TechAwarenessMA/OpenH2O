import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEcoData } from '../hooks/useEcoData';
import { C, F } from '../theme';

const PROC_MSGS = [
  'Reading your conversations...',
  'Counting tokens...',
  'Calculating energy usage...',
  'Estimating water consumption...',
  'Computing carbon emissions...',
  'Generating comparisons...',
  'Almost there...',
];

export default function Processing() {
  const { status, hasData, error } = useEcoData();
  const navigate = useNavigate();
  const [msgIndex, setMsgIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (hasData) {
      setProgress(100);
      const timer = setTimeout(() => navigate('/dashboard'), 600);
      return () => clearTimeout(timer);
    }
  }, [hasData, navigate]);

  useEffect(() => {
    if (status === 'idle') navigate('/');
  }, [status, navigate]);

  useEffect(() => {
    if (!hasData) {
      const interval = setInterval(() => {
        setMsgIndex(i => (i + 1) % PROC_MSGS.length);
        setProgress(p => Math.min(p + 12, 90));
      }, 700);
      return () => clearInterval(interval);
    }
  }, [hasData]);

  return (
    <section data-screen-label="Processing" style={{
      flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      gap: '32px', minHeight: '70vh', padding: '40px 20px', animation: 'fadeUp 0.4s ease both',
    }}>
      <h1 style={{ fontFamily: F.anton, fontSize: 'clamp(48px,9vw,120px)', margin: 0, textTransform: 'uppercase', color: 'transparent', WebkitTextStroke: `2.5px ${C.ink}`, lineHeight: 1 }}>Analyzing</h1>

      <div style={{ width: 'min(440px, 82vw)', border: `2px solid ${C.ink}`, height: '20px', background: C.paper }}>
        <div style={{ height: '100%', background: C.ink, transition: 'width 0.4s ease', width: `${progress}%` }} />
      </div>

      <p style={{ fontFamily: F.mono, fontSize: '11px', letterSpacing: '0.18em', textTransform: 'uppercase', margin: 0, animation: 'blink 1.6s ease infinite' }}>{PROC_MSGS[msgIndex]}</p>

      {error && (
        <div style={{ border: `2px solid ${C.ink}`, padding: '20px 24px', maxWidth: '440px', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <p style={{ fontFamily: F.mono, fontSize: '11px', letterSpacing: '0.14em', textTransform: 'uppercase', margin: 0, fontWeight: 600 }}>! Something went wrong</p>
          <p style={{ fontSize: '13px', margin: 0, color: C.body }}>{error}</p>
          <button onClick={() => navigate('/')} style={{ fontFamily: F.mono, fontSize: '10px', letterSpacing: '0.16em', textTransform: 'uppercase', background: C.ink, color: C.paper, border: 'none', padding: '10px 18px', cursor: 'pointer', alignSelf: 'center' }}>Try again</button>
        </div>
      )}
    </section>
  );
}
