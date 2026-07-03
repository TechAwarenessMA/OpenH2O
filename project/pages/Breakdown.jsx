import { useState } from 'react';
import { useEcoData } from '../hooks/useEcoData';
import { formatNumber as fmt, formatDate } from '../utils/formatters';
import { C, F, sectionWide } from '../theme';
import EmptyState from '../components/EmptyState';

const PAGE_SIZE = 20;
const GRID = 'minmax(0,2.4fr) repeat(4, minmax(0,1fr)) minmax(0,0.6fr)';
const SORT_COLS = [
  ['TOKENS', 'totalTokens'], ['ENERGY', 'energyKwh'], ['WATER', 'waterLiters'],
  ['CARBON', 'carbonGrams'], ['MSGS', 'messageCount'],
];

const micro = (o = {}) => ({ fontFamily: F.mono, fontSize: '9px', letterSpacing: '0.16em', textTransform: 'uppercase', ...o });
const num = { fontFamily: F.mono, fontSize: '11.5px', textAlign: 'right' };
const detailLabel = { fontFamily: F.mono, fontSize: '8.5px', letterSpacing: '0.16em', textTransform: 'uppercase', opacity: 0.5, display: 'block', marginBottom: '6px' };
const detailVal = { fontFamily: F.anton, fontSize: '24px' };

export default function Breakdown() {
  const eco = useEcoData();
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState('totalTokens');
  const [sortDir, setSortDir] = useState('desc');
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState(null);

  if (!eco.hasData) return <EmptyState />;

  const { totals: t, conversations } = eco;

  const toggleSort = (key) => {
    if (sortKey === key) setSortDir(d => (d === 'desc' ? 'asc' : 'desc'));
    else { setSortKey(key); setSortDir('desc'); }
    setPage(0);
  };

  let filtered = conversations;
  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(c => (c.title || '').toLowerCase().includes(q));
  }
  filtered = [...filtered].sort((x, y) => {
    const xv = x[sortKey] || 0, yv = y[sortKey] || 0;
    return sortDir === 'desc' ? yv - xv : xv - yv;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const curPage = Math.min(page, totalPages - 1);
  const top5 = new Set([...conversations].sort((x, y) => y.totalTokens - x.totalTokens).slice(0, 5));
  const rows = filtered.slice(curPage * PAGE_SIZE, (curPage + 1) * PAGE_SIZE);

  return (
    <section data-screen-label="Breakdown" style={{ ...sectionWide, gap: '24px' }}>
      <div>
        <h1 style={{ fontFamily: F.anton, fontSize: 'clamp(48px,7vw,96px)', margin: 0, textTransform: 'uppercase', lineHeight: 0.95 }}>Breakdown</h1>
        <p style={micro({ fontSize: '10px', letterSpacing: '0.14em', margin: '14px 0 0', color: C.muted })}>{fmt(filtered.length)} conversations · sorted by impact · click a row to inspect</p>
      </div>

      {/* Search */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', border: `2px solid ${C.ink}`, padding: '12px 16px' }}>
        <span style={{ fontFamily: F.mono, fontSize: '12px' }}>⌕</span>
        <input
          type="text" placeholder="SEARCH CONVERSATIONS..." value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(0); }}
          style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', fontFamily: F.mono, fontSize: '12px', letterSpacing: '0.08em', color: C.ink }}
        />
        {search && <button onClick={() => { setSearch(''); setPage(0); }} className="oh-textlink" style={micro({ fontSize: '9px' })}>Clear</button>}
      </div>

      {/* Table */}
      <div style={{ borderTop: `2px solid ${C.ink}` }}>
        {/* header row */}
        <div style={{ display: 'grid', gridTemplateColumns: GRID, gap: '8px', padding: '12px 0', borderBottom: `2px solid ${C.ink}` }}>
          <span style={micro({ fontWeight: 600 })}>Conversation</span>
          {SORT_COLS.map(([lab, key]) => (
            <button key={key} onClick={() => toggleSort(key)} className="oh-nav" style={{ ...micro({ fontWeight: 600 }), textAlign: 'right', padding: 0 }}>
              {lab} {sortKey === key ? (sortDir === 'desc' ? '▼' : '▲') : ''}
            </button>
          ))}
        </div>

        {/* rows */}
        {rows.map((c) => {
          const key = (c.title || '') + '|' + (c.createdAt || '');
          const sel = selected === key;
          return (
            <div key={key}>
              <div
                onClick={() => setSelected(sel ? null : key)}
                role="button" tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setSelected(sel ? null : key); }}
                className="oh-row"
                style={{ display: 'grid', gridTemplateColumns: GRID, gap: '8px', padding: '14px 0', borderBottom: `1px solid ${C.hairSoft}`, alignItems: 'center', background: sel ? C.panel : 'transparent' }}
              >
                <div style={{ minWidth: 0, paddingLeft: '6px' }}>
                  <p style={{ margin: 0, fontSize: '14px', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {top5.has(c) ? '■ ' : ''}<span style={{ fontFamily: F.mono, fontSize: '9px', letterSpacing: '0.08em', color: C.muted }}>{c.source === 'chatgpt' ? '[GPT]' : '[C]'}</span> {c.title || 'Untitled'}
                  </p>
                  <p style={{ margin: '3px 0 0', fontFamily: F.mono, fontSize: '9px', letterSpacing: '0.1em', color: C.muted, textTransform: 'uppercase' }}>{formatDate(c.createdAt)}</p>
                </div>
                <span style={num}>{fmt(c.totalTokens)}</span>
                <span style={num}>{fmt(c.energyKwh, 6)}</span>
                <span style={num}>{fmt(c.waterLiters, 4)}</span>
                <span style={num}>{fmt(c.carbonGrams, 4)}</span>
                <span style={num}>{String(c.messageCount)}</span>
              </div>

              {sel && (
                <div style={{ background: C.ink, color: C.paper, padding: '20px clamp(16px,2vw,28px)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px,1fr))', gap: '18px' }}>
                  <div><span style={detailLabel}>Input tokens</span><span style={detailVal}>{fmt(c.inputTokens)}</span></div>
                  <div><span style={detailLabel}>Output tokens</span><span style={detailVal}>{fmt(c.outputTokens)}</span></div>
                  <div><span style={detailLabel}>Energy kWh</span><span style={detailVal}>{fmt(c.energyKwh, 6)}</span></div>
                  <div><span style={detailLabel}>Water L</span><span style={detailVal}>{fmt(c.waterLiters, 4)}</span></div>
                  <div><span style={detailLabel}>Share of total</span><span style={detailVal}>{t.totalTokens > 0 ? ((c.totalTokens / t.totalTokens) * 100).toFixed(1) : '0'}%</span></div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {totalPages > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
          <button onClick={() => { setPage(p => Math.max(0, p - 1)); setSelected(null); }} disabled={curPage === 0} className="oh-out" style={micro({ fontSize: '10px', padding: '9px 16px' })}>← Prev</button>
          <span style={micro({ fontSize: '10px', color: C.muted })}>PAGE {curPage + 1} OF {totalPages}</span>
          <button onClick={() => { setPage(p => Math.min(totalPages - 1, p + 1)); setSelected(null); }} disabled={curPage >= totalPages - 1} className="oh-out" style={micro({ fontSize: '10px', padding: '9px 16px' })}>Next →</button>
        </div>
      )}

      <p style={micro({ fontSize: '9px', letterSpacing: '0.14em', margin: 0, color: C.muted })}>■ = Top 5 impact &nbsp;·&nbsp; [C] Claude &nbsp;[GPT] ChatGPT</p>
    </section>
  );
}
