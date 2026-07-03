import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEcoData } from '../hooks/useEcoData';
import { formatNumber as fmt, formatDate, formatMonth } from '../utils/formatters';
import { getComparisons } from '../data/comparisons';
import { COEFFICIENTS } from '../data/coefficients';
import { GPT_COEFFICIENTS } from '../data/gptCoefficients';
import { exportConversationsCSV } from '../utils/exportCsv';
import { C, F, sectionWide } from '../theme';
import EmptyState from '../components/EmptyState';

/* Single 0→1 count-up factor, cubic ease-out over ~1.4s. */
function useCountFactor(duration = 1400) {
  const [a, setA] = useState(0);
  const raf = useRef();
  useEffect(() => {
    const t0 = performance.now();
    const step = (ts) => {
      const p = Math.min((ts - t0) / duration, 1);
      setA(1 - Math.pow(1 - p, 3));
      if (p < 1) raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf.current);
  }, [duration]);
  return a;
}

const label = (o = {}) => ({ fontFamily: F.mono, fontSize: '10px', letterSpacing: '0.18em', textTransform: 'uppercase', ...o });
const micro = (o = {}) => ({ fontFamily: F.mono, fontSize: '9px', letterSpacing: '0.16em', textTransform: 'uppercase', color: C.muted, ...o });

export default function Dashboard() {
  const navigate = useNavigate();
  const eco = useEcoData();
  const a = useCountFactor();
  const [daily, setDaily] = useState(5);

  if (!eco.hasData) return <EmptyState />;

  const { totals: t, conversations, monthlyData: monthly, dateRange, sources, isSample } = eco;

  const comp = getComparisons(t);
  const B = comp.badges;
  const eq = (b) => b.description.replace('Equivalent to ', '');
  const fc = (n, dec = 1) => {
    if (n === 0) return '0';
    if (n < 0.1) return n < 0.01 ? n.toFixed(4) : n.toFixed(2);
    return fmt(n, dec);
  };

  const nConvos = t.totalConversations;
  const epc = nConvos > 0 ? t.energyKwh / nConvos : 0;
  const wpc = nConvos > 0 ? t.waterLiters / nConvos : 0;
  const cpc = nConvos > 0 ? t.carbonGrams / nConvos : 0;

  const dateLabel = (dateRange && dateRange.earliest && dateRange.latest)
    ? `${formatDate(dateRange.earliest)} — ${formatDate(dateRange.latest)}`.toUpperCase() : '';
  const modelsLabel = (sources || []).map(x => x === 'claude' ? 'CLAUDE SONNET 4.6' : 'GPT-5').join(' + ');

  const facts = [
    `Your AI usage = leaving a lightbulb on for ${fc(B[0].count, 1)} hours.`,
    `That's the same water as ${fc(B[2].count, 1)} water bottles.`,
    `Carbon equivalent of driving ${fc(B[4].count, 2)} miles.`,
    `Same CO₂ as charging your phone ${fc(B[5].count, 1)} times.`,
  ];

  const badges = B.map(b => ({ count: fmt(b.count, b.count < 1 ? 2 : b.count < 10 ? 1 : 0), title: b.title.toUpperCase() }));

  const hasChart = monthly.length > 1;
  const maxTok = Math.max(1, ...monthly.map(m => m.tokens));
  const monthlyBars = monthly.map(m => ({
    label: formatMonth(m.month).toUpperCase(),
    pct: Math.max(2, (m.tokens / maxTok) * 100),
    title: `${fmt(m.tokens)} tokens · ${m.conversations} conversations`,
  }));

  const inT = t.inputTokens || 0, outT = t.outputTokens || 0;
  const totT = inT + outT;
  const inPct = totT > 0 ? Math.round((inT / totT) * 100) : 0;
  const outPct = 100 - inPct;

  const isMixed = (sources || []).length > 1;
  let inEnergyPct = 0, outEnergyPct = 0, inEnergyNote = 'energy varies by model', outEnergyNote = 'energy varies by model';
  if (!isMixed) {
    const coeff = sources[0] === 'chatgpt' ? GPT_COEFFICIENTS : COEFFICIENTS;
    const inE = inT * coeff.energy_per_input_token_wh;
    const outE = outT * coeff.energy_per_output_token_wh;
    const totE = inE + outE;
    inEnergyPct = totE > 0 ? Math.round((inE / totE) * 100) : 0;
    outEnergyPct = 100 - inEnergyPct;
    inEnergyNote = `${inEnergyPct}% of energy`;
    outEnergyNote = `${outEnergyPct}% of energy`;
  }
  const mixedNote = isMixed ? ' Energy ratios vary between Claude and GPT — see Methodology for details.' : '';

  const annual = daily * 365;
  const hairTop = { borderTop: `1px solid ${C.hair}` };

  return (
    <section data-screen-label="Dashboard" style={{ ...sectionWide, gap: 'clamp(32px,4vw,56px)' }}>

      {/* Header */}
      <div>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
          <h1 style={{ fontFamily: F.anton, fontSize: 'clamp(48px,7vw,96px)', margin: 0, textTransform: 'uppercase', lineHeight: 0.95 }}>Your impact</h1>
          <button onClick={() => exportConversationsCSV(conversations)} className="oh-out" style={{ ...micro({ color: C.ink }), padding: '9px 16px', marginBottom: '8px' }}>↓ Export CSV</button>
        </div>
        <p style={micro({ color: C.ink, margin: '14px 0 0', lineHeight: 2.1, fontSize: '10px', letterSpacing: '0.14em' })}>{dateLabel} &nbsp;·&nbsp; {fmt(nConvos)} conversations &nbsp;·&nbsp; {fmt(t.totalMessages || 0)} messages &nbsp;·&nbsp; {fmt(nConvos > 0 ? Math.round(t.totalTokens / nConvos) : 0)} avg tokens/convo</p>
        <p style={micro({ margin: '4px 0 0', fontSize: '9px', letterSpacing: '0.12em' })}>
          Calculated using {modelsLabel} coefficients · estimates ±50% ·{' '}
          <button onClick={() => navigate('/methodology')} className="oh-textlink" style={{ font: 'inherit', letterSpacing: 'inherit', textTransform: 'inherit', textUnderlineOffset: '2px' }}>See methodology</button>
          {isSample && <> · <span style={{ border: `1px solid ${C.ink}`, padding: '1px 6px', color: C.ink }}>SAMPLE DATA</span></>}
        </p>
      </div>

      {/* Big 3 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px,1fr))', borderTop: `2px solid ${C.ink}`, borderBottom: `2px solid ${C.ink}` }}>
        {[
          { tag: '(C) — Total carbon', value: fmt(t.carbonGrams * a, 2), unit: 'g CO₂e', e1: eq(B[4]), e2: eq(B[5]), pad: '28px 24px 28px 0', border: false },
          { tag: '(W) — Total water', value: fmt(t.waterLiters * a, 2), unit: 'liters', e1: eq(B[2]), e2: eq(B[3]), pad: '28px 24px', border: true },
          { tag: '(E) — Total energy', value: fmt(t.energyKwh * a, 4), unit: 'kWh', e1: eq(B[0]), e2: eq(B[1]), pad: '28px 0 28px 24px', border: true },
        ].map((m) => (
          <div key={m.tag} style={{ padding: m.pad, borderLeft: m.border ? `1px solid ${C.hair}` : 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <span style={label()}>{m.tag}</span>
            <span style={{ fontFamily: F.anton, fontSize: 'clamp(52px,5.4vw,88px)', lineHeight: 0.95 }}>{m.value}</span>
            <span style={micro({ fontSize: '11px' })}>{m.unit}</span>
            <div style={{ borderTop: `1px solid ${C.hair}`, marginTop: '10px', paddingTop: '12px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <span style={{ fontSize: '13px', color: C.body, fontWeight: 500 }}>≈ {m.e1}</span>
              <span style={{ fontSize: '13px', color: C.body, fontWeight: 500 }}>≈ {m.e2}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Fun facts band */}
      <div style={{ background: C.ink, color: C.paper, padding: 'clamp(24px,3vw,40px)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px,1fr))', gap: 'clamp(20px,3vw,36px)' }}>
        {facts.map((f, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <span style={{ fontFamily: F.mono, fontSize: '9px', letterSpacing: '0.18em', opacity: 0.5 }}>(F{i + 1})</span>
            <span style={{ fontSize: '14px', lineHeight: 1.5, fontWeight: 500 }}>{f}</span>
          </div>
        ))}
      </div>

      {/* Per conversation */}
      <div>
        <p style={label({ margin: '0 0 14px' })}>Average per conversation</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px,1fr))', ...hairTop }}>
          {[
            { v: fmt(epc, 5), u: 'kWh per conversation', pad: '16px 16px 0 0', border: false },
            { v: fmt(wpc, 3), u: 'liters per conversation', pad: '16px 16px 0 16px', border: true },
            { v: fmt(cpc, 3), u: 'g CO₂ per conversation', pad: '16px 0 0 16px', border: true },
          ].map((x, i) => (
            <div key={i} style={{ padding: x.pad, borderLeft: x.border ? `1px solid ${C.hair}` : 'none' }}>
              <span style={{ fontFamily: F.anton, fontSize: '30px', display: 'block' }}>{x.v}</span>
              <span style={micro()}>{x.u}</span>
            </div>
          ))}
        </div>
      </div>

      {/* In perspective */}
      <div>
        <p style={micro({ margin: '0 0 4px', fontSize: '10px', letterSpacing: '0.18em' })}>(03) — The full picture</p>
        <h2 style={{ fontFamily: F.anton, fontSize: 'clamp(28px,3vw,42px)', margin: '0 0 20px', textTransform: 'uppercase' }}>In perspective</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px,1fr))', gap: '20px' }}>
          {badges.map((b, i) => (
            <div key={i} style={{ borderTop: `2px solid ${C.ink}`, paddingTop: '12px' }}>
              <span style={{ fontFamily: F.anton, fontSize: '30px', display: 'block', lineHeight: 1 }}>{b.count}</span>
              <span style={micro({ display: 'block', marginTop: '6px', fontSize: '9px', letterSpacing: '0.14em' })}>{b.title}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Monthly usage */}
      {hasChart && (
        <div>
          <h2 style={{ fontFamily: F.anton, fontSize: 'clamp(28px,3vw,42px)', margin: '0 0 6px', textTransform: 'uppercase' }}>Monthly usage</h2>
          <p style={micro({ margin: '0 0 20px' })}>Tokens per month</p>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 'clamp(4px,0.8vw,12px)', height: '220px', borderBottom: `2px solid ${C.ink}` }}>
            {monthlyBars.map((bar, i) => (
              <div key={i} title={bar.title} style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', height: '100%' }}>
                <div style={{ background: C.ink, width: '100%', height: `${bar.pct}%` }} />
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 'clamp(4px,0.8vw,12px)', marginTop: '8px' }}>
            {monthlyBars.map((bar, i) => (
              <span key={i} style={{ flex: 1, fontFamily: F.mono, fontSize: '8.5px', letterSpacing: '0.08em', textTransform: 'uppercase', textAlign: 'center', color: C.muted, whiteSpace: 'nowrap', overflow: 'hidden' }}>{bar.label}</span>
            ))}
          </div>
        </div>
      )}

      {/* Token distribution */}
      <div>
        <h2 style={{ fontFamily: F.anton, fontSize: 'clamp(28px,3vw,42px)', margin: '0 0 20px', textTransform: 'uppercase' }}>Token distribution</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px,1fr))', gap: '24px', marginBottom: '24px' }}>
          <div style={{ borderTop: `1px solid ${C.hair}`, paddingTop: '14px' }}>
            <span style={label({ fontSize: '10px', letterSpacing: '0.16em' })}>■ Your prompts (input)</span>
            <span style={{ fontFamily: F.anton, fontSize: '38px', display: 'block', marginTop: '8px' }}>{fmt(inT)}</span>
            <span style={micro({ fontSize: '9px', letterSpacing: '0.14em' })}>{inPct}% of tokens · {inEnergyNote}</span>
          </div>
          <div style={{ borderTop: `1px solid ${C.hair}`, paddingTop: '14px' }}>
            <span style={label({ fontSize: '10px', letterSpacing: '0.16em' })}>□ AI replies (output)</span>
            <span style={{ fontFamily: F.anton, fontSize: '38px', display: 'block', marginTop: '8px' }}>{fmt(outT)}</span>
            <span style={micro({ fontSize: '9px', letterSpacing: '0.14em' })}>{outPct}% of tokens · {outEnergyNote}</span>
          </div>
        </div>

        <p style={micro({ margin: '0 0 8px', fontSize: '9px', letterSpacing: '0.16em' })}>Token ratio</p>
        <div style={{ height: '20px', border: `2px solid ${C.ink}`, display: 'flex', overflow: 'hidden' }}>
          <div style={{ background: C.ink, width: `${inPct}%` }} />
          <div style={{ flex: 1, background: `repeating-linear-gradient(45deg, ${C.ink} 0px, ${C.ink} 3px, transparent 3px, transparent 8px)` }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
          <span style={micro({ color: C.ink, fontSize: '9px', letterSpacing: '0.14em' })}>■ Input · {inPct}%</span>
          <span style={micro({ color: C.ink, fontSize: '9px', letterSpacing: '0.14em' })}>▤ Output · {outPct}%</span>
        </div>

        {!isMixed && (
          <>
            <p style={micro({ margin: '20px 0 8px', fontSize: '9px', letterSpacing: '0.16em' })}>Energy contribution</p>
            <div style={{ height: '20px', border: `2px solid ${C.ink}`, display: 'flex', overflow: 'hidden' }}>
              <div style={{ background: C.ink, width: `${inEnergyPct}%` }} />
              <div style={{ flex: 1, background: `repeating-linear-gradient(45deg, ${C.ink} 0px, ${C.ink} 3px, transparent 3px, transparent 8px)` }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
              <span style={micro({ color: C.ink, fontSize: '9px', letterSpacing: '0.14em' })}>■ Input · {inEnergyPct}%</span>
              <span style={micro({ color: C.ink, fontSize: '9px', letterSpacing: '0.14em' })}>▤ Output · {outEnergyPct}%</span>
            </div>
          </>
        )}
        <p style={{ fontSize: '13px', color: C.body, margin: '16px 0 0', maxWidth: '640px', lineHeight: 1.5, fontWeight: 500 }}>Output tokens cost ~3× more energy than input tokens (autoregressive generation vs. single forward pass).{mixedNote}</p>
      </div>

      {/* Projection */}
      <div style={{ border: `2px solid ${C.ink}`, padding: 'clamp(20px,3vw,36px)' }}>
        <p style={micro({ margin: '0 0 4px', fontSize: '10px', letterSpacing: '0.18em' })}>(04) — What if you keep going?</p>
        <h2 style={{ fontFamily: F.anton, fontSize: 'clamp(28px,3vw,42px)', margin: '0 0 24px', textTransform: 'uppercase' }}>Annual projection</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap', marginBottom: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
            <span style={{ fontFamily: F.anton, fontSize: '56px', lineHeight: 1 }}>{daily}</span>
            <span style={micro()}>convos / day</span>
          </div>
          <input type="range" min="1" max="50" value={daily} onChange={(e) => setDaily(Number(e.target.value))} aria-label="Daily conversations" style={{ flex: 1, minWidth: '140px', height: '4px', cursor: 'pointer' }} />
          <span style={{ fontFamily: F.mono, fontSize: '11px', letterSpacing: '0.12em', border: `1px solid ${C.ink}`, padding: '6px 12px' }}>{annual.toLocaleString()} / YR</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px,1fr))', ...hairTop }}>
          {[
            { v: fmt(epc * annual, 3), u: 'kWh energy', pad: '16px 16px 0 0', border: false },
            { v: fmt(wpc * annual, 2), u: 'liters water', pad: '16px 16px 0 16px', border: true },
            { v: fmt(cpc * annual, 2), u: 'g CO₂ carbon', pad: '16px 0 0 16px', border: true },
          ].map((x, i) => (
            <div key={i} style={{ padding: x.pad, borderLeft: x.border ? `1px solid ${C.hair}` : 'none' }}>
              <span style={{ fontFamily: F.anton, fontSize: '28px', display: 'block' }}>{x.v}</span>
              <span style={micro()}>{x.u}</span>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div style={{ background: C.ink, color: C.paper, padding: 'clamp(28px,4vw,48px)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '24px', flexWrap: 'wrap' }}>
        <div>
          <h2 style={{ fontFamily: F.anton, fontSize: 'clamp(28px,3.4vw,48px)', margin: 0, textTransform: 'uppercase', lineHeight: 1 }}>Awareness is<br />the first step.</h2>
          <p style={{ fontSize: '13.5px', margin: '14px 0 0', color: 'rgba(241,239,233,0.6)', maxWidth: '420px', lineHeight: 1.5, fontWeight: 500 }}>Explore tips to reduce your footprint and understand the methodology behind these numbers.</p>
        </div>
        <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
          <button onClick={() => navigate('/insights')} className="oh-light" style={{ fontFamily: F.mono, fontSize: '11px', letterSpacing: '0.14em', textTransform: 'uppercase', padding: '14px 22px', fontWeight: 600 }}>Reduce my impact →</button>
          <button onClick={() => navigate('/methodology')} className="oh-ghostd" style={{ fontFamily: F.mono, fontSize: '11px', letterSpacing: '0.14em', textTransform: 'uppercase', padding: '14px 22px', fontWeight: 600 }}>Methodology</button>
        </div>
      </div>
    </section>
  );
}
