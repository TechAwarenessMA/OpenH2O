import { useNavigate } from 'react-router-dom';
import { useEcoData } from '../hooks/useEcoData';
import { getTips } from '../data/tips';
import { getComparisons } from '../data/comparisons';
import { formatNumber as fmt, formatMonth } from '../utils/formatters';
import { C, F, sectionWide } from '../theme';
import EmptyState from '../components/EmptyState';

const DID_YOU_KNOW = [
  'A single large language model training run can emit as much carbon as five cars over their entire lifetimes.',
  'Data centers consume about 1-2% of global electricity, and AI workloads are among the most energy-intensive tasks.',
  'The water used to cool data centers could supply millions of households — and demand is growing 20-30% per year.',
  'AI inference (running queries) now consumes more total energy than training, because it runs billions of times.',
  'A single ChatGPT query uses roughly 10x the energy of a Google search.',
  'By 2030, data centers are projected to consume 3-4% of global electricity, driven largely by AI.',
];

const eyebrow = (o = {}) => ({ fontFamily: F.mono, fontSize: '10px', letterSpacing: '0.18em', textTransform: 'uppercase', margin: 0, ...o });
const micro = (o = {}) => ({ fontFamily: F.mono, fontSize: '9px', letterSpacing: '0.16em', textTransform: 'uppercase', color: C.muted, ...o });

export default function Insights() {
  const navigate = useNavigate();
  const eco = useEcoData();

  if (!eco.hasData) return <EmptyState />;

  const { totals: t, conversations, monthlyData: monthly } = eco;
  const nConvos = t.totalConversations;

  const avgMessages = nConvos > 0 ? (t.totalMessages / nConvos).toFixed(1) : '0';
  const ioRatio = (t.inputTokens > 0 && t.outputTokens > 0) ? (t.outputTokens / t.inputTokens).toFixed(1) : null;
  const peakMonth = monthly.length > 0 ? monthly.reduce((best, m) => (m.tokens > best.tokens ? m : best), monthly[0]) : null;
  const topConvo = conversations.length > 0 ? [...conversations].sort((x, y) => y.totalTokens - x.totalTokens)[0] : null;

  const statCards = [
    { label: 'AVG MESSAGES / CONVO', value: avgMessages, sub: 'messages per conversation' },
    { label: 'OUTPUT MULTIPLIER', value: ioRatio ? ioRatio + '×' : '—', sub: ioRatio ? `For every token you type, AI generates ${ioRatio}` : 'Not enough data' },
    { label: 'PEAK MONTH', value: peakMonth ? formatMonth(peakMonth.month).toUpperCase() : '—', sub: peakMonth ? `${fmt(peakMonth.tokens)} tokens` : '' },
    { label: 'HEAVIEST CONVERSATION', value: topConvo ? fmt(topConvo.totalTokens) : '—', sub: topConvo ? (topConvo.title || 'Untitled') : '' },
  ];

  const hasTrends = monthly.length >= 2;
  let trends = [];
  if (hasTrends) {
    const last = monthly[monthly.length - 1];
    const prev = monthly[monthly.length - 2];
    const tokenPct = prev.tokens > 0 ? Math.round(((last.tokens - prev.tokens) / prev.tokens) * 100) : 0;
    const convoPct = prev.conversations > 0 ? Math.round(((last.conversations - prev.conversations) / prev.conversations) * 100) : 0;
    const lastAvg = last.conversations > 0 ? last.tokens / last.conversations : 0;
    const prevAvg = prev.conversations > 0 ? prev.tokens / prev.conversations : 0;
    const effPct = prevAvg > 0 ? Math.round(((lastAvg - prevAvg) / prevAvg) * 100) : 0;
    const mk = (label, pct, up, down, same) => ({
      label,
      arrow: pct > 0 ? '▲' : pct < 0 ? '▼' : '—',
      pctLabel: (pct > 0 ? '+' : '') + pct + '%',
      description: pct > 0 ? up : pct < 0 ? down : same,
    });
    trends = [
      mk('TOKEN USAGE', tokenPct,
        `You used ${Math.abs(tokenPct)}% more tokens in ${formatMonth(last.month)} vs ${formatMonth(prev.month)}.`,
        `You used ${Math.abs(tokenPct)}% fewer tokens in ${formatMonth(last.month)} vs ${formatMonth(prev.month)}.`,
        'Token usage stayed the same.'),
      mk('CONVERSATION COUNT', convoPct,
        `${Math.abs(convoPct)}% more conversations this month.`,
        `${Math.abs(convoPct)}% fewer conversations this month.`,
        'Same number of conversations.'),
      mk('AVG TOKENS / CONVO', effPct,
        `Conversations are getting ${Math.abs(effPct)}% longer on average.`,
        `Conversations are ${Math.abs(effPct)}% more concise on average.`,
        'Conversation length is stable.'),
    ];
  }

  const badges = getComparisons(t).badges.map(b => ({
    count: fmt(b.count, b.count < 1 ? 2 : b.count < 10 ? 1 : 0),
    title: b.title.toUpperCase(),
  }));

  const sortedTips = [...getTips(t, conversations)].sort((x, y) => {
    if (x.category === 'pattern' && y.category !== 'pattern') return -1;
    if (x.category !== 'pattern' && y.category === 'pattern') return 1;
    return 0;
  });
  const tips = sortedTips.map((tip, i) => ({
    idx: 'T' + String(i + 1).padStart(2, '0'),
    title: tip.title,
    description: tip.description,
    tag: '[' + tip.category.toUpperCase() + ']',
  }));

  const didYouKnow = DID_YOU_KNOW[nConvos % DID_YOU_KNOW.length];

  return (
    <section data-screen-label="Insights" style={{ ...sectionWide, gap: 'clamp(32px,4vw,56px)' }}>
      <div>
        <h1 style={{ fontFamily: F.anton, fontSize: 'clamp(48px,7vw,96px)', margin: 0, textTransform: 'uppercase', lineHeight: 0.95 }}>Insights</h1>
        <p style={micro({ fontSize: '10px', letterSpacing: '0.14em', margin: '14px 0 0' })}>Patterns, trends, and tips from {fmt(nConvos)} conversations</p>
      </div>

      {/* Usage DNA */}
      <div>
        <p style={eyebrow({ margin: '0 0 16px' })}>(01) — Your usage DNA</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px,1fr))', gap: '20px' }}>
          {statCards.map((card, i) => (
            <div key={i} style={{ borderTop: `2px solid ${C.ink}`, paddingTop: '14px' }}>
              <span style={micro({ display: 'block' })}>{card.label}</span>
              <span style={{ fontFamily: F.anton, fontSize: 'clamp(28px,2.6vw,38px)', display: 'block', marginTop: '8px', lineHeight: 1 }}>{card.value}</span>
              <span style={{ fontSize: '12.5px', color: C.body, display: 'block', marginTop: '8px', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{card.sub}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Trends */}
      {hasTrends && (
        <div>
          <p style={eyebrow({ margin: '0 0 16px' })}>(02) — Month-over-month trends</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px,1fr))', gap: '20px' }}>
            {trends.map((tr, i) => (
              <div key={i} style={{ border: `2px solid ${C.ink}`, padding: '20px' }}>
                <span style={micro({ display: 'block', marginBottom: '10px' })}>{tr.label}</span>
                <span style={{ fontFamily: F.anton, fontSize: '36px', lineHeight: 1 }}>{tr.arrow} {tr.pctLabel}</span>
                <p style={{ fontSize: '12.5px', color: C.body, margin: '10px 0 0', lineHeight: 1.5, fontWeight: 500 }}>{tr.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Perspective */}
      <div>
        <p style={eyebrow({ margin: '0 0 16px' })}>(03) — Your impact in perspective</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px,1fr))', gap: '20px' }}>
          {badges.map((b, i) => (
            <div key={i} style={{ borderTop: `2px solid ${C.ink}`, paddingTop: '12px' }}>
              <span style={{ fontFamily: F.anton, fontSize: '30px', display: 'block', lineHeight: 1 }}>{b.count}</span>
              <span style={micro({ display: 'block', marginTop: '6px', letterSpacing: '0.14em' })}>{b.title}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Tips */}
      <div>
        <p style={eyebrow({ margin: '0 0 4px' })}>(04) — Reduce your footprint</p>
        <p style={{ fontSize: '13px', color: C.muted, margin: '0 0 8px', fontWeight: 500 }}>Personalized tips based on your usage patterns</p>
        <div style={{ borderTop: `2px solid ${C.ink}` }}>
          {tips.map((tip, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '56px minmax(0,1fr) auto', gap: '16px', padding: '18px 0', borderBottom: `1px solid ${C.hairSoft}`, alignItems: 'baseline' }}>
              <span style={{ fontFamily: F.mono, fontSize: '10px', letterSpacing: '0.12em', color: C.muted }}>{tip.idx}</span>
              <div>
                <p style={{ margin: 0, fontSize: '15px', fontWeight: 700 }}>{tip.title}</p>
                <p style={{ margin: '5px 0 0', fontSize: '13.5px', color: C.body, lineHeight: 1.5, fontWeight: 500, maxWidth: '640px' }}>{tip.description}</p>
              </div>
              <span style={micro()}>{tip.tag}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Bigger picture */}
      <div style={{ background: C.ink, color: C.paper, padding: 'clamp(28px,4vw,48px)' }}>
        <h2 style={{ fontFamily: F.anton, fontSize: 'clamp(28px,3.4vw,48px)', margin: '0 0 20px', textTransform: 'uppercase' }}>The bigger picture</h2>
        <div style={{ border: '1px solid rgba(241,239,233,0.3)', padding: '18px 20px', marginBottom: '20px' }}>
          <p style={{ fontFamily: F.mono, fontSize: '9px', letterSpacing: '0.18em', textTransform: 'uppercase', margin: '0 0 8px', opacity: 0.55 }}>Did you know?</p>
          <p style={{ fontSize: '14.5px', margin: 0, lineHeight: 1.55, fontWeight: 500 }}>{didYouKnow}</p>
        </div>
        <p style={{ fontSize: '13.5px', color: 'rgba(241,239,233,0.65)', margin: '0 0 24px', maxWidth: '640px', lineHeight: 1.6, fontWeight: 500 }}>While individual AI usage may seem small, awareness is the first step toward more sustainable practices. By understanding your footprint, you can make more informed choices about when and how you use AI tools.</p>
        <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
          <button onClick={() => navigate('/methodology')} className="oh-light" style={{ fontFamily: F.mono, fontSize: '10px', letterSpacing: '0.14em', textTransform: 'uppercase', padding: '12px 20px', fontWeight: 600 }}>See methodology →</button>
          <button onClick={() => navigate('/about')} className="oh-ghostd" style={{ fontFamily: F.mono, fontSize: '10px', letterSpacing: '0.14em', textTransform: 'uppercase', padding: '12px 20px', fontWeight: 600 }}>About OpenH2O</button>
        </div>
      </div>
    </section>
  );
}
