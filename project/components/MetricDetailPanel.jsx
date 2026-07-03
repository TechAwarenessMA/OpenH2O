import { X, Zap, Droplets, Cloud, TrendingUp, BarChart3 } from 'lucide-react';
import { formatNumber, formatMonth } from '../utils/formatters';
import { COEFFICIENTS } from '../data/coefficients';

const PANELS = {
  carbon: {
    title: 'Carbon Footprint',
    icon: Cloud,
    accent: '#FB4B5F',
    unit: 'g CO₂e',
  },
  water: {
    title: 'Water Usage',
    icon: Droplets,
    accent: '#16C0FF',
    unit: 'liters',
  },
  energy: {
    title: 'Energy Consumption',
    icon: Zap,
    accent: '#2ECC71',
    unit: 'kWh',
  },
  monthly: {
    title: 'Monthly Breakdown',
    icon: BarChart3,
    accent: '#FAC206',
    unit: '',
  },
};

function getValue(convo, panel) {
  if (panel === 'carbon') return convo.carbonGrams;
  if (panel === 'water') return convo.waterLiters;
  if (panel === 'energy') return convo.energyKwh;
  return convo.totalTokens;
}

function getDecimals(panel) {
  if (panel === 'carbon') return 4;
  if (panel === 'water') return 4;
  if (panel === 'energy') return 6;
  return 0;
}

function FormulaBlock({ panel }) {
  const totalWater = COEFFICIENTS.direct_water_per_kwh_liters + COEFFICIENTS.indirect_water_per_kwh_liters;

  const formulas = {
    energy: {
      steps: [
        { label: 'Raw Energy', formula: `(inputTokens × ${COEFFICIENTS.energy_per_input_token_wh}) + (outputTokens × ${COEFFICIENTS.energy_per_output_token_wh})` },
        { label: 'With PUE', formula: `rawEnergy × ${COEFFICIENTS.pue_multiplier}` },
        { label: 'To kWh', formula: 'totalWh ÷ 1000' },
      ],
      note: `Output tokens cost ~50× more energy than input tokens due to autoregressive generation.`,
    },
    water: {
      steps: [
        { label: 'Direct cooling', formula: `energyKwh × ${COEFFICIENTS.direct_water_per_kwh_liters} L/kWh` },
        { label: 'Indirect (grid)', formula: `energyKwh × ${COEFFICIENTS.indirect_water_per_kwh_liters} L/kWh` },
        { label: 'Total', formula: `energyKwh × ${totalWater} L/kWh` },
      ],
      note: 'Water is used for direct cooling of servers and indirectly through electricity generation.',
    },
    carbon: {
      steps: [
        { label: 'Grid intensity', formula: `${COEFFICIENTS.carbon_per_kwh_gco2e} g CO₂e per kWh (US avg)` },
        { label: 'Total carbon', formula: `energyKwh × ${COEFFICIENTS.carbon_per_kwh_gco2e}` },
      ],
      note: 'Carbon intensity varies by region. US average grid is used.',
    },
  };

  const data = formulas[panel];
  if (!data) return null;

  return (
    <div className="space-y-2">
      <p className="text-xs font-black text-navy uppercase tracking-wider">How it's calculated</p>
      {data.steps.map((s, i) => (
        <div key={i} className="flex items-start gap-2 p-2 bg-cream border-2 border-navy/10">
          <span className="text-[10px] font-black text-white bg-navy w-5 h-5 flex items-center justify-center flex-shrink-0">{i + 1}</span>
          <div className="min-w-0">
            <p className="text-xs font-black text-navy">{s.label}</p>
            <p className="text-[11px] font-mono text-slate font-bold break-all">{s.formula}</p>
          </div>
        </div>
      ))}
      <p className="text-[11px] font-bold text-slate/70 leading-snug">{data.note}</p>
    </div>
  );
}

function TopConversations({ conversations, panel, meta }) {
  const sorted = [...conversations].sort((a, b) => getValue(b, panel) - getValue(a, panel));
  const top = sorted.slice(0, 8);
  const dec = getDecimals(panel);

  return (
    <div className="space-y-2">
      <p className="text-xs font-black text-navy uppercase tracking-wider">Top conversations by {meta.title.toLowerCase()}</p>
      <div className="border-2 border-navy/10 divide-y divide-navy/5 max-h-56 overflow-y-auto">
        {top.map((c, i) => (
          <div key={i} className="flex items-center gap-2 px-3 py-2">
            <span className="text-[10px] font-black text-slate w-4 flex-shrink-0">{i + 1}</span>
            <p className="text-xs font-bold text-ink flex-1 min-w-0 truncate">{c.title || 'Untitled'}</p>
            <span className="text-xs font-black text-navy flex-shrink-0">
              {formatNumber(getValue(c, panel), dec)} <span className="text-slate">{meta.unit}</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function MonthlyTable({ monthlyData }) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-black text-navy uppercase tracking-wider">Month-by-month detail</p>
      <div className="border-2 border-navy/10 overflow-x-auto max-h-72 overflow-y-auto">
        <table className="w-full text-xs">
          <thead className="sticky top-0 bg-cream">
            <tr className="border-b-2 border-navy/10">
              <th className="text-left py-2 px-2 font-black text-navy">Month</th>
              <th className="text-right py-2 px-2 font-black text-navy">Convos</th>
              <th className="text-right py-2 px-2 font-black text-navy">Tokens</th>
              <th className="text-right py-2 px-2 font-black text-navy">Energy</th>
              <th className="text-right py-2 px-2 font-black text-navy">Water</th>
              <th className="text-right py-2 px-2 font-black text-navy">Carbon</th>
            </tr>
          </thead>
          <tbody>
            {monthlyData.map((m, i) => (
              <tr key={i} className="border-b border-navy/5">
                <td className="py-2 px-2 font-bold text-ink">{formatMonth(m.month)}</td>
                <td className="py-2 px-2 text-right font-bold text-ink">{m.conversations}</td>
                <td className="py-2 px-2 text-right font-bold text-ink">{formatNumber(m.tokens)}</td>
                <td className="py-2 px-2 text-right font-bold text-green">{formatNumber(m.energyKwh, 5)}</td>
                <td className="py-2 px-2 text-right font-bold text-sky">{formatNumber(m.waterLiters, 4)}</td>
                <td className="py-2 px-2 text-right font-bold text-coral">{formatNumber(m.carbonGrams, 4)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatsRow({ label, value, unit, color }) {
  return (
    <div className="flex items-center justify-between p-3 bg-cream border-2 border-navy/10">
      <span className="text-xs font-black text-slate uppercase tracking-wider">{label}</span>
      <span className="text-sm font-black" style={{ color }}>{value} <span className="text-slate text-[10px]">{unit}</span></span>
    </div>
  );
}

export default function MetricDetailPanel({ panel, totals, conversations, monthlyData, comparisons, onClose }) {
  const meta = PANELS[panel];
  if (!meta) return null;

  const Icon = meta.icon;
  const isMonthly = panel === 'monthly';

  // Stats for metric panels
  const total = panel === 'carbon' ? totals.carbonGrams
    : panel === 'water' ? totals.waterLiters
    : panel === 'energy' ? totals.energyKwh : 0;

  const perConvo = totals.totalConversations > 0 ? total / totals.totalConversations : 0;
  const perMessage = totals.totalMessages > 0 ? total / totals.totalMessages : 0;
  const dec = getDecimals(panel);

  // Relevant comparisons
  const relevantBadges = panel === 'carbon' ? [comparisons.badges[4], comparisons.badges[5]]
    : panel === 'water' ? [comparisons.badges[2], comparisons.badges[3]]
    : panel === 'energy' ? [comparisons.badges[0], comparisons.badges[1]]
    : [];

  // Monthly trend
  const monthlyTrend = !isMonthly && monthlyData.length > 1 ? (() => {
    const vals = monthlyData.map(m =>
      panel === 'carbon' ? m.carbonGrams : panel === 'water' ? m.waterLiters : m.energyKwh
    );
    const last = vals[vals.length - 1];
    const prev = vals[vals.length - 2];
    if (prev === 0) return null;
    const pct = ((last - prev) / prev * 100).toFixed(0);
    return { pct, up: last > prev };
  })() : null;

  return (
    <div
      className="border-4 border-navy bg-white flex flex-col max-h-[85vh]"
      style={{ boxShadow: `6px 6px 0px 0px ${meta.accent}` }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 p-4 border-b-4 border-navy bg-cream flex-shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className="w-8 h-8 flex items-center justify-center border-2 border-navy flex-shrink-0"
            style={{ background: meta.accent }}
          >
            <Icon size={16} className="text-navy" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-black text-navy leading-tight">{meta.title}</h3>
            {!isMonthly && (
              <p className="text-xs font-bold text-slate">
                {formatNumber(total, dec)} {meta.unit} total
              </p>
            )}
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-7 h-7 flex items-center justify-center border-2 border-navy/20 hover:border-coral hover:bg-coral/10 transition-colors flex-shrink-0"
          aria-label="Close panel"
        >
          <X size={14} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {isMonthly ? (
          <>
            <div className="space-y-1">
              <StatsRow label="Total months" value={monthlyData.length} unit="" color="#2C3E50" />
              <StatsRow
                label="Avg convos/month"
                value={formatNumber(monthlyData.reduce((s, m) => s + m.conversations, 0) / monthlyData.length, 1)}
                unit="" color="#2C3E50"
              />
              <StatsRow
                label="Peak month"
                value={formatMonth(monthlyData.reduce((best, m) => m.tokens > best.tokens ? m : best, monthlyData[0]).month)}
                unit="" color="#FAC206"
              />
            </div>
            <MonthlyTable monthlyData={monthlyData} />
          </>
        ) : (
          <>
            {/* Summary stats */}
            <div className="space-y-1">
              <StatsRow label="Total" value={formatNumber(total, dec)} unit={meta.unit} color={meta.accent} />
              <StatsRow label="Per conversation" value={formatNumber(perConvo, dec + 1)} unit={meta.unit} color={meta.accent} />
              <StatsRow label="Per message" value={formatNumber(perMessage, dec + 2)} unit={meta.unit} color={meta.accent} />
              {monthlyTrend && (
                <div className="flex items-center justify-between p-3 bg-cream border-2 border-navy/10">
                  <span className="text-xs font-black text-slate uppercase tracking-wider">Month-over-month</span>
                  <span className={`text-sm font-black flex items-center gap-1 ${monthlyTrend.up ? 'text-coral' : 'text-green'}`}>
                    <TrendingUp size={12} className={monthlyTrend.up ? '' : 'rotate-180'} />
                    {monthlyTrend.up ? '+' : ''}{monthlyTrend.pct}%
                  </span>
                </div>
              )}
            </div>

            {/* Comparisons */}
            {relevantBadges.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-black text-navy uppercase tracking-wider">In perspective</p>
                {relevantBadges.map((b, i) => (
                  <div key={i} className="flex items-center gap-2 p-3 bg-sunshine/20 border-2 border-sunshine/40">
                    <span className="text-xl">{b.emoji}</span>
                    <p className="text-xs font-bold text-ink">{b.description}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Formula */}
            <FormulaBlock panel={panel} />

            {/* Top conversations */}
            <TopConversations conversations={conversations} panel={panel} meta={meta} />
          </>
        )}
      </div>
    </div>
  );
}
