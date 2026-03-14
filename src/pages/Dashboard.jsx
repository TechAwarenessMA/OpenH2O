import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEcoData } from '../hooks/useEcoData';
import UsageChart from '../components/UsageChart';
import { formatNumber, formatDate } from '../utils/formatters';
import { getComparisons } from '../data/comparisons';
import { COEFFICIENTS } from '../data/coefficients';
import { Zap, Droplets, Cloud, ArrowRight, BookOpen, Calendar } from 'lucide-react';

/* ── Animated count-up ─────────────────────────────────────── */
function useCountUp(target, duration = 1600) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!target) return;
    let start = null;
    let raf;
    const step = (ts) => {
      if (!start) start = ts;
      const pct = Math.min((ts - start) / duration, 1);
      const ease = 1 - Math.pow(1 - pct, 3);
      setVal(target * ease);
      if (pct < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return val;
}

function N({ value, decimals = 0 }) {
  const v = useCountUp(value);
  return <>{formatNumber(v, decimals)}</>;
}

/* ── Big 3 Metric Card ─────────────────────────────────────── */
function MetricCard({ label, value, decimals, unit, icon: Icon, accentColor, shadowColor, equivs }) {
  return (
    <div
      className="bg-white border-4 border-navy p-6 flex flex-col gap-3 transition-transform hover:-translate-y-0.5"
      style={{ boxShadow: `8px 8px 0px 0px ${shadowColor}` }}
    >
      <div className="flex items-center gap-2">
        <div
          className="w-8 h-8 flex items-center justify-center border-2 border-navy"
          style={{ background: accentColor }}
        >
          <Icon size={16} className="text-navy" />
        </div>
        <span className="text-xs font-black text-slate uppercase tracking-wider">{label}</span>
      </div>

      <div className="mt-1">
        <span className="text-6xl md:text-7xl font-black text-navy leading-none tracking-tight">
          <N value={value} decimals={decimals} />
        </span>
        <span className="text-base font-black text-slate ml-2 uppercase">{unit}</span>
      </div>

      {equivs && equivs.length > 0 && (
        <div className="border-t-2 border-navy/10 pt-3 mt-1 space-y-1.5">
          {equivs.map((eq, i) => (
            <p key={i} className="text-sm font-bold text-slate">
              <span className="text-lg mr-1">{eq.emoji}</span>
              {eq.description.replace('Equivalent to ', '')}
            </p>
          ))}
        </div>
      )}

      <p className="text-xs font-bold text-slate/50 mt-auto">
        Estimated ±{COEFFICIENTS.uncertainty_range_pct}%
      </p>
    </div>
  );
}

/* ── Token Distribution Panel ──────────────────────────────── */
function TokenPanel({ inputTokens, outputTokens }) {
  const total = inputTokens + outputTokens;
  const inputPct = total > 0 ? Math.round((inputTokens / total) * 100) : 0;
  const outputPct = 100 - inputPct;

  const inputEnergyWh = inputTokens * COEFFICIENTS.energy_per_input_token_wh;
  const outputEnergyWh = outputTokens * COEFFICIENTS.energy_per_output_token_wh;
  const totalEnergyWh = inputEnergyWh + outputEnergyWh;
  const inputEnergyPct = totalEnergyWh > 0 ? Math.round((inputEnergyWh / totalEnergyWh) * 100) : 0;
  const outputEnergyPct = 100 - inputEnergyPct;

  return (
    <div
      className="bg-white border-4 border-navy p-6"
      style={{ boxShadow: '4px 4px 0px 0px #2C3E50' }}
    >
      <h2 className="text-lg font-black text-navy uppercase tracking-wider mb-5">
        Token Distribution
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
        <div className="p-5 bg-cream border-4 border-navy/10">
          <p className="text-xs font-black text-slate uppercase tracking-wider mb-2">
            Your Prompts (Input)
          </p>
          <p className="text-3xl font-black text-navy">{formatNumber(inputTokens)}</p>
          <p className="text-xs font-bold text-slate mt-1">
            {inputPct}% of tokens · {inputEnergyPct}% of energy
          </p>
        </div>
        <div className="p-5 bg-cream border-4 border-navy/10">
          <p className="text-xs font-black text-slate uppercase tracking-wider mb-2">
            Claude's Replies (Output)
          </p>
          <p className="text-3xl font-black text-navy">{formatNumber(outputTokens)}</p>
          <p className="text-xs font-bold text-slate mt-1">
            {outputPct}% of tokens · {outputEnergyPct}% of energy
          </p>
        </div>
      </div>

      <p className="text-xs font-black text-slate uppercase tracking-wider mb-2">Token Ratio</p>
      <div className="h-4 border-4 border-navy flex overflow-hidden">
        <div className="bg-sky transition-all" style={{ width: `${inputPct}%` }} />
        <div className="bg-coral flex-1" />
      </div>
      <div className="flex justify-between mt-1.5">
        <span className="text-xs font-black text-sky">Input · {inputPct}%</span>
        <span className="text-xs font-black text-coral">Output · {outputPct}%</span>
      </div>

      <p className="text-xs font-black text-slate uppercase tracking-wider mb-2 mt-4">Energy Contribution</p>
      <div className="h-4 border-4 border-navy flex overflow-hidden">
        <div className="bg-sky transition-all" style={{ width: `${inputEnergyPct}%` }} />
        <div className="bg-coral flex-1" />
      </div>
      <div className="flex justify-between mt-1.5">
        <span className="text-xs font-black text-sky">Input · {inputEnergyPct}%</span>
        <span className="text-xs font-black text-coral">Output · {outputEnergyPct}%</span>
      </div>
      <p className="text-xs font-bold text-slate/60 mt-3">
        Output tokens cost ~3× more energy than input tokens (autoregressive generation vs. single forward pass)
      </p>
    </div>
  );
}

/* ── Fun Facts Strip ───────────────────────────────────────── */
function FunFacts({ comparisons }) {
  const facts = [
    {
      emoji: comparisons.badges[0].emoji,
      text: `Your AI usage = leaving a lightbulb on for ${formatNumber(comparisons.badges[0].count, 1)} hours`,
    },
    {
      emoji: comparisons.badges[2].emoji,
      text: `That's the same water as ${formatNumber(comparisons.badges[2].count, 1)} water bottles`,
    },
    {
      emoji: comparisons.badges[4].emoji,
      text: `Carbon equivalent of driving ${formatNumber(comparisons.badges[4].count, 2)} miles`,
    },
    {
      emoji: comparisons.badges[5].emoji,
      text: `Same CO₂ as charging your phone ${formatNumber(comparisons.badges[5].count, 1)} times`,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {facts.map((fact, i) => (
        <div
          key={i}
          className="bg-sunshine border-4 border-navy p-5 text-ink font-black text-sm leading-snug transition-transform hover:-translate-y-0.5"
          style={{ boxShadow: '4px 4px 0px 0px #2C3E50' }}
        >
          <span className="text-3xl block mb-3">{fact.emoji}</span>
          {fact.text}
        </div>
      ))}
    </div>
  );
}

/* ── Per-conversation strip ────────────────────────────────── */
function PerConvoStrip({ energyPerConvo, waterPerConvo, carbonPerConvo }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {[
        { val: energyPerConvo, dec: 5, unit: 'kWh per conversation', color: '#2ECC71' },
        { val: waterPerConvo,  dec: 3, unit: 'liters per conversation', color: '#16C0FF' },
        { val: carbonPerConvo, dec: 3, unit: 'g CO₂ per conversation', color: '#FB4B5F' },
      ].map((item, i) => (
        <div
          key={i}
          className="bg-white border-4 border-navy p-5 text-center"
          style={{ boxShadow: '4px 4px 0px 0px #2C3E50' }}
        >
          <span className="text-3xl font-black block leading-none" style={{ color: item.color }}>
            <N value={item.val} decimals={item.dec} />
          </span>
          <span className="text-xs font-black text-slate uppercase tracking-wider mt-2 block">
            {item.unit}
          </span>
        </div>
      ))}
    </div>
  );
}

/* ── Projection slider ─────────────────────────────────────── */
function Projection({ energyPerConvo, waterPerConvo, carbonPerConvo }) {
  const [daily, setDaily] = useState(5);
  const annual = daily * 365;

  return (
    <div
      className="bg-white border-4 border-navy p-6"
      style={{ boxShadow: '4px 4px 0px 0px #2C3E50' }}
    >
      <p className="text-xs font-black text-slate uppercase tracking-wider mb-1">What if you keep going?</p>
      <h2 className="text-lg font-black text-navy uppercase tracking-wider mb-5">
        Annual Impact Projection
      </h2>

      <div className="flex flex-wrap items-center gap-4 mb-6">
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-black text-navy">{daily}</span>
          <span className="text-xs font-black text-slate uppercase tracking-wider">convos / day</span>
        </div>
        <input
          type="range" min={1} max={50} value={daily}
          onChange={e => setDaily(Number(e.target.value))}
          className="flex-1 min-w-[120px] accent-sunshine h-2"
          aria-label="Daily conversations"
        />
        <span className="text-sm font-black text-navy bg-cream border-2 border-navy/10 px-3 py-1">
          {annual.toLocaleString()} / yr
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { val: energyPerConvo * annual, dec: 3, unit: 'kWh', label: 'energy', color: '#2ECC71' },
          { val: waterPerConvo * annual,  dec: 2, unit: 'liters', label: 'water', color: '#16C0FF' },
          { val: carbonPerConvo * annual, dec: 2, unit: 'g CO₂', label: 'carbon', color: '#FB4B5F' },
        ].map((item, i) => (
          <div key={i} className="p-4 bg-cream border-4 border-navy/10 text-center">
            <span className="text-2xl font-black block" style={{ color: item.color }}>
              {formatNumber(item.val, item.dec)}
            </span>
            <span className="text-xs font-black text-slate uppercase tracking-wider">
              {item.unit} {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Context cards grid ────────────────────────────────────── */
function ContextGrid({ comparisons }) {
  return (
    <div
      className="bg-white border-4 border-navy p-6"
      style={{ boxShadow: '4px 4px 0px 0px #2C3E50' }}
    >
      <p className="text-xs font-black text-slate uppercase tracking-wider mb-1">The full picture</p>
      <h2 className="text-lg font-black text-navy uppercase tracking-wider mb-5">
        In Perspective
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {comparisons.badges.map((badge, i) => (
          <div
            key={i}
            className="bg-cream border-4 border-navy/10 p-4 text-center transition-transform hover:-translate-y-0.5"
          >
            <div className="text-2xl mb-2">{badge.emoji}</div>
            <div className="text-xl font-black text-navy leading-none">
              {formatNumber(badge.count, badge.count < 1 ? 2 : badge.count < 10 ? 1 : 0)}
            </div>
            <div className="text-xs font-bold text-slate mt-1 leading-tight">{badge.title}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Dashboard ─────────────────────────────────────────────── */
export default function Dashboard() {
  const { hasData, totals, monthlyData, dateRange } = useEcoData();
  const navigate = useNavigate();

  if (!hasData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-in px-8">
        <h2 className="text-2xl font-black text-navy mb-4">No data yet</h2>
        <p className="text-slate font-bold mb-6">
          Upload your conversations.json to see your impact.
        </p>
        <button
          onClick={() => navigate('/')}
          className="px-6 py-3 bg-sunshine text-ink font-black text-sm uppercase tracking-wider border-4 border-navy hover:-translate-y-0.5 transition-transform"
          style={{ boxShadow: '4px 4px 0px 0px #2C3E50' }}
        >
          Upload Data
        </button>
      </div>
    );
  }

  const comparisons   = getComparisons(totals);
  const inputTokens   = totals.inputTokens  ?? 0;
  const outputTokens  = totals.outputTokens ?? 0;
  const totalMessages = totals.totalMessages ?? 0;
  const avgTokens     = Math.round(totals.totalTokens / totals.totalConversations);
  const energyPerConvo = totals.energyKwh   / totals.totalConversations;
  const waterPerConvo  = totals.waterLiters  / totals.totalConversations;
  const carbonPerConvo = totals.carbonGrams  / totals.totalConversations;

  const dateLabel =
    dateRange?.earliest && dateRange?.latest
      ? `${formatDate(dateRange.earliest)} — ${formatDate(dateRange.latest)}`
      : null;

  return (
    <div className="space-y-6 animate-fade-in-up">

      {/* ── Header Row ──────────────────────────────────────── */}
      <div
        className="border-4 border-navy bg-white p-6"
        style={{ boxShadow: '4px 4px 0px 0px #2C3E50' }}
      >
        <h1 className="text-3xl md:text-4xl font-black text-navy tracking-tight uppercase">
          Your Impact
        </h1>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3">
          {dateLabel && (
            <span className="flex items-center gap-1.5 text-sm font-bold text-slate">
              <Calendar size={14} />
              {dateLabel}
            </span>
          )}
          <span className="text-sm font-bold text-navy bg-cream border-2 border-navy/10 px-2 py-0.5">
            <N value={totals.totalConversations} /> conversations
          </span>
          {totalMessages > 0 && (
            <span className="text-sm font-bold text-navy bg-cream border-2 border-navy/10 px-2 py-0.5">
              <N value={totalMessages} /> messages
            </span>
          )}
          <span className="text-sm font-bold text-slate">
            {formatNumber(avgTokens)} avg tokens/convo
          </span>
        </div>
        <p className="text-xs font-bold text-slate/60 mt-3">
          Calculated using {COEFFICIENTS.model_label} coefficients ·{' '}
          estimates ±{COEFFICIENTS.uncertainty_range_pct}% ·{' '}
          <button
            onClick={() => navigate('/methodology')}
            className="text-green underline font-black"
          >
            See methodology
          </button>
        </p>
      </div>

      {/* ── Big 3 Metric Cards ──────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard
          label="Carbon"
          value={totals.carbonGrams}
          decimals={2}
          unit="g CO₂e"
          icon={Cloud}
          accentColor="#FB4B5F"
          shadowColor="#FB4B5F"
          equivs={[comparisons.badges[4], comparisons.badges[5]]}
        />
        <MetricCard
          label="Water"
          value={totals.waterLiters}
          decimals={2}
          unit="liters"
          icon={Droplets}
          accentColor="#16C0FF"
          shadowColor="#16C0FF"
          equivs={[comparisons.badges[2], comparisons.badges[3]]}
        />
        <MetricCard
          label="Energy"
          value={totals.energyKwh}
          decimals={4}
          unit="kWh"
          icon={Zap}
          accentColor="#2ECC71"
          shadowColor="#2ECC71"
          equivs={[comparisons.badges[0], comparisons.badges[1]]}
        />
      </div>

      {/* ── Per-conversation strip ──────────────────────────── */}
      <PerConvoStrip
        energyPerConvo={energyPerConvo}
        waterPerConvo={waterPerConvo}
        carbonPerConvo={carbonPerConvo}
      />

      {/* ── Fun Facts Strip ─────────────────────────────────── */}
      <FunFacts comparisons={comparisons} />

      {/* ── Context grid ────────────────────────────────────── */}
      <ContextGrid comparisons={comparisons} />

      {/* ── Monthly Usage Chart ─────────────────────────────── */}
      {monthlyData.length > 1 && (
        <div
          className="bg-white border-4 border-navy p-6"
          style={{ boxShadow: '4px 4px 0px 0px #2C3E50' }}
        >
          <h2 className="text-lg font-black text-navy uppercase tracking-wider mb-4">
            Monthly Usage
          </h2>
          <UsageChart data={monthlyData} />
        </div>
      )}

      {/* ── Token Distribution ──────────────────────────────── */}
      <TokenPanel inputTokens={inputTokens} outputTokens={outputTokens} />

      {/* ── Projection slider ───────────────────────────────── */}
      <Projection
        energyPerConvo={energyPerConvo}
        waterPerConvo={waterPerConvo}
        carbonPerConvo={carbonPerConvo}
      />

      {/* ── CTA Strip ───────────────────────────────────────── */}
      <div
        className="border-4 border-navy bg-navy p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        style={{ boxShadow: '4px 4px 0px 0px #FAC206' }}
      >
        <div>
          <h2 className="text-xl font-black text-white uppercase tracking-wide">
            Awareness is the first step.
          </h2>
          <p className="text-sm font-bold text-white/60 mt-1">
            Explore tips to reduce your footprint and understand the methodology behind these numbers.
          </p>
        </div>
        <div className="flex gap-3 flex-shrink-0">
          <button
            onClick={() => navigate('/insights')}
            className="flex items-center gap-2 px-5 py-3 bg-sunshine border-4 border-navy text-ink font-black text-sm uppercase tracking-wider hover:-translate-y-0.5 transition-transform min-h-12"
          >
            Reduce My Impact <ArrowRight size={14} />
          </button>
          <button
            onClick={() => navigate('/methodology')}
            className="flex items-center gap-2 px-5 py-3 bg-transparent border-4 border-white/30 text-white font-black text-sm uppercase tracking-wider hover:border-sunshine hover:text-sunshine transition-colors min-h-12"
          >
            Methodology <BookOpen size={14} />
          </button>
        </div>
      </div>

      {/* ── Disclaimer ──────────────────────────────────────── */}
      <p className="text-xs text-slate font-bold text-center py-2">
        Estimates based on publicly available research data.{' '}
        <button
          onClick={() => navigate('/methodology')}
          className="text-green underline font-black"
        >
          See methodology →
        </button>
      </p>

    </div>
  );
}
