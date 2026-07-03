/**
 * OpenH2O design tokens — brutalist paper/ink system.
 * Mirrors the Claude Design prototype (index.html handoff).
 */
export const C = {
  ink: '#111110',
  paper: '#F1EFE9',
  muted: '#6E6B62',
  body: '#3D3B36',
  hair: 'rgba(17,17,16,0.25)',
  hairSoft: 'rgba(17,17,16,0.18)',
  panel: '#E7E4DC',
};

export const F = {
  anton: 'Anton, sans-serif',
  archivo: 'Archivo, sans-serif',
  mono: "'IBM Plex Mono', monospace",
};

/** Monospace label helper */
export const mono = (o = {}) => ({ fontFamily: F.mono, ...o });

/** Anton display heading helper (always uppercase) */
export const anton = (o = {}) => ({ fontFamily: F.anton, textTransform: 'uppercase', ...o });

/** Small uppercase mono eyebrow, e.g. "(01) — SECTION" */
export const eyebrow = {
  fontFamily: F.mono,
  fontSize: '10px',
  letterSpacing: '0.18em',
  textTransform: 'uppercase',
  margin: 0,
};

/** Section shells reused by dashboard / breakdown / insights / methodology / about */
export const sectionWide = {
  maxWidth: '1280px',
  width: '100%',
  margin: '0 auto',
  padding: 'clamp(24px,4vw,56px) clamp(16px,3vw,40px) 64px',
  boxSizing: 'border-box',
  display: 'flex',
  flexDirection: 'column',
  animation: 'fadeUp 0.5s ease both',
};

export const sectionNarrow = {
  ...sectionWide,
  maxWidth: '1080px',
};
