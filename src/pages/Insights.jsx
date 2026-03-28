import { useNavigate } from 'react-router-dom';
import { useEcoData } from '../hooks/useEcoData';
import InsightTip from '../components/InsightTip';
import { getTips } from '../data/tips';
import { formatNumber, formatMonth } from '../utils/formatters';
import { getComparisons } from '../data/comparisons';
import {
  TrendingUp, TrendingDown, MessageSquare, Zap, Trophy,
  Calendar, Lightbulb, ArrowRight, Globe, BarChart3,
} from 'lucide-react';

/* ── Stat Card ─────────────────────────────────────────────── */
function StatCard({ label, value, sub, icon: Icon, accentColor }) {
  return (
    <div
      className="bg-white border-4 border-navy p-5 flex flex-col gap-2"
      style={{ boxShadow: `4px 4px 0px 0px ${accentColor}` }}
    >
      <div className="flex items-center gap-2">
        <div
          className="w-7 h-7 flex items-center justify-center border-2 border-navy flex-shrink-0"
          style={{ background: accentColor }}
        >
          <Icon size={14} className="text-navy" />
        </div>
        <span className="text-[10px] font-black text-slate uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-2xl font-black text-navy leading-none">{value}</p>
      {sub && <p className="text-xs font-bold text-slate leading-snug truncate">{sub}</p>}
    </div>
  );
}

/* ── Trend Card ────────────────────────────────────────────── */
function TrendCard({ label, pct, positive, description }) {
  const isUp = pct > 0;
  const Icon = isUp ? TrendingUp : TrendingDown;
  const color = positive ? 'text-green' : 'text-coral';

  return (
    <div
      className="bg-white border-4 border-navy p-5"
      style={{ boxShadow: '4px 4px 0px 0px #2C3E50' }}
    >
      <p className="text-[10px] font-black text-slate uppercase tracking-wider mb-2">{label}</p>
      <div className="flex items-center gap-2 mb-1">
        <Icon size={20} className={color} />
        <span className={`text-2xl font-black ${color}`}>
          {isUp ? '+' : ''}{pct}%
        </span>
      </div>
      <p className="text-xs font-bold text-slate leading-snug">{description}</p>
    </div>
  );
}

/* ── Comparison Card ───────────────────────────────────────── */
const ACCENT_COLORS = ['#2ECC71', '#2ECC71', '#16C0FF', '#16C0FF', '#FB4B5F', '#FB4B5F'];

function ComparisonCard({ badge, accentColor }) {
  return (
    <div
      className="bg-white border-4 border-navy p-4 text-center transition-transform hover:-translate-y-0.5"
      style={{ boxShadow: `3px 3px 0px 0px ${accentColor}` }}
    >
      <div
        className="h-1.5 -mx-4 -mt-4 mb-3"
        style={{ background: accentColor }}
      />
      <div className="text-3xl mb-2">{badge.emoji}</div>
      <div className="text-xl font-black text-navy leading-none">
        {formatNumber(badge.count, badge.count < 1 ? 2 : badge.count < 10 ? 1 : 0)}
      </div>
      <div className="text-[10px] font-black text-slate uppercase tracking-wider mt-1 leading-tight">
        {badge.title}
      </div>
    </div>
  );
}

/* ── Did You Know Facts ────────────────────────────────────── */
const DID_YOU_KNOW = [
  'A single large language model training run can emit as much carbon as five cars over their entire lifetimes.',
  'Data centers consume about 1-2% of global electricity, and AI workloads are among the most energy-intensive tasks.',
  'The water used to cool data centers could supply millions of households — and demand is growing 20-30% per year.',
  'AI inference (running queries) now consumes more total energy than training, because it runs billions of times.',
  'A single ChatGPT query uses roughly 10x the energy of a Google search.',
  'By 2030, data centers are projected to consume 3-4% of global electricity, driven largely by AI.',
];

/* ── Main Page ─────────────────────────────────────────────── */
export default function Insights() {
  const { hasData, totals, conversations, monthlyData } = useEcoData();
  const navigate = useNavigate();

  if (!hasData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-in px-8">
        <h2 className="text-2xl font-black text-navy mb-4">No data yet</h2>
        <p className="text-slate font-bold mb-6">Upload your conversations.json to see insights.</p>
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

  const tips = getTips(totals, conversations);
  const comparisons = getComparisons(totals);

  // ── Usage DNA stats ──
  const avgMessages = totals.totalConversations > 0
    ? (totals.totalMessages / totals.totalConversations).toFixed(1)
    : '0';

  const ioRatio = totals.inputTokens > 0 && totals.outputTokens > 0
    ? (totals.outputTokens / totals.inputTokens).toFixed(1)
    : null;

  const peakMonth = monthlyData.length > 0
    ? monthlyData.reduce((best, m) => m.tokens > best.tokens ? m : best, monthlyData[0])
    : null;

  const sortedByTokens = [...conversations].sort((a, b) => b.totalTokens - a.totalTokens);
  const topConvo = sortedByTokens[0];

  // ── Trends (need >= 2 months) ──
  const hasTrends = monthlyData.length >= 2;
  let trends = [];
  if (hasTrends) {
    const last = monthlyData[monthlyData.length - 1];
    const prev = monthlyData[monthlyData.length - 2];

    const tokenPct = prev.tokens > 0 ? Math.round(((last.tokens - prev.tokens) / prev.tokens) * 100) : 0;
    const convoPct = prev.conversations > 0 ? Math.round(((last.conversations - prev.conversations) / prev.conversations) * 100) : 0;

    const lastAvg = last.conversations > 0 ? last.tokens / last.conversations : 0;
    const prevAvg = prev.conversations > 0 ? prev.tokens / prev.conversations : 0;
    const effPct = prevAvg > 0 ? Math.round(((lastAvg - prevAvg) / prevAvg) * 100) : 0;

    trends = [
      {
        label: 'Token Usage',
        pct: tokenPct,
        positive: tokenPct <= 0,
        description: tokenPct > 0
          ? `You used ${Math.abs(tokenPct)}% more tokens in ${formatMonth(last.month)} vs ${formatMonth(prev.month)}.`
          : tokenPct < 0
            ? `You used ${Math.abs(tokenPct)}% fewer tokens in ${formatMonth(last.month)} vs ${formatMonth(prev.month)}.`
            : `Token usage stayed the same.`,
      },
      {
        label: 'Conversation Count',
        pct: convoPct,
        positive: convoPct <= 0,
        description: convoPct > 0
          ? `${Math.abs(convoPct)}% more conversations this month.`
          : convoPct < 0
            ? `${Math.abs(convoPct)}% fewer conversations this month.`
            : `Same number of conversations.`,
      },
      {
        label: 'Avg Tokens/Convo',
        pct: effPct,
        positive: effPct <= 0,
        description: effPct > 0
          ? `Conversations are getting ${Math.abs(effPct)}% longer on average.`
          : effPct < 0
            ? `Conversations are ${Math.abs(effPct)}% more concise on average.`
            : `Conversation length is stable.`,
      },
    ];
  }

  // ── Pick a "did you know" fact ──
  const factIndex = totals.totalConversations % DID_YOU_KNOW.length;
  const didYouKnow = DID_YOU_KNOW[factIndex];

  // ── Sort tips: conditional (personalized) first ──
  const sortedTips = [...tips].sort((a, b) => {
    if (a.category === 'pattern' && b.category !== 'pattern') return -1;
    if (a.category !== 'pattern' && b.category === 'pattern') return 1;
    return 0;
  });

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* ── 1. Header ──────────────────────────────────────────── */}
      <div>
        <h1 className="text-3xl md:text-4xl font-black text-navy tracking-tight uppercase">Insights</h1>
        <p className="text-slate font-bold mt-1">
          Patterns, trends, and tips from {formatNumber(totals.totalConversations)} conversations
        </p>
      </div>

      {/* ── 2. Usage DNA ───────────────────────────────────────── */}
      <div>
        <p className="text-xs font-black text-slate uppercase tracking-wider mb-3">Your Usage DNA</p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Avg Messages / Convo"
            value={avgMessages}
            sub="messages per conversation"
            icon={MessageSquare}
            accentColor="#FAC206"
          />
          <StatCard
            label="Output Multiplier"
            value={ioRatio ? `${ioRatio}x` : '—'}
            sub={ioRatio ? `For every token you type, AI generates ${ioRatio} tokens` : 'Not enough data'}
            icon={Zap}
            accentColor="#2ECC71"
          />
          <StatCard
            label="Peak Month"
            value={peakMonth ? formatMonth(peakMonth.month) : '—'}
            sub={peakMonth ? `${formatNumber(peakMonth.tokens)} tokens` : ''}
            icon={Calendar}
            accentColor="#16C0FF"
          />
          <StatCard
            label="Heaviest Conversation"
            value={topConvo ? formatNumber(topConvo.totalTokens) : '—'}
            sub={topConvo ? (topConvo.title || 'Untitled') : ''}
            icon={Trophy}
            accentColor="#FB4B5F"
          />
        </div>
      </div>

      {/* ── 3. Trends ──────────────────────────────────────────── */}
      {hasTrends && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <BarChart3 size={14} className="text-navy" />
            <p className="text-xs font-black text-slate uppercase tracking-wider">Month-over-Month Trends</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {trends.map((t, i) => (
              <TrendCard key={i} {...t} />
            ))}
          </div>
        </div>
      )}

      {/* ── 4. Real-World Comparisons ──────────────────────────── */}
      <div
        className="border-4 border-navy bg-white p-6"
        style={{ boxShadow: '4px 4px 0px 0px #FAC206' }}
      >
        <p className="text-xs font-black text-slate uppercase tracking-wider mb-1">The full picture</p>
        <h2 className="text-lg font-black text-navy uppercase tracking-wider mb-5">
          Your Impact In Perspective
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {comparisons.badges.map((badge, i) => (
            <ComparisonCard key={i} badge={badge} accentColor={ACCENT_COLORS[i]} />
          ))}
        </div>
      </div>

      {/* ── 5. Personalized Tips ───────────────────────────────── */}
      <div
        className="border-4 border-navy bg-white p-6"
        style={{ boxShadow: '4px 4px 0px 0px #2ECC71' }}
      >
        <div className="flex items-center gap-3 mb-5">
          <div className="w-8 h-8 bg-green flex items-center justify-center border-2 border-navy">
            <Lightbulb size={18} className="text-navy" />
          </div>
          <div>
            <h2 className="text-lg font-black text-navy uppercase tracking-wider">Reduce Your Footprint</h2>
            <p className="text-xs font-bold text-slate">Personalized tips based on your usage patterns</p>
          </div>
        </div>
        <div className="space-y-3">
          {sortedTips.map((tip, i) => (
            <InsightTip key={i} {...tip} />
          ))}
        </div>
      </div>

      {/* ── 6. The Bigger Picture ──────────────────────────────── */}
      <div
        className="border-4 border-navy bg-navy p-6"
        style={{ boxShadow: '4px 4px 0px 0px #FAC206' }}
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 bg-sunshine flex items-center justify-center border-2 border-navy">
            <Globe size={18} className="text-navy" />
          </div>
          <h2 className="text-lg font-black text-white uppercase tracking-wider">The Bigger Picture</h2>
        </div>

        <div className="bg-white/10 border-2 border-white/20 p-4 mb-4">
          <p className="text-xs font-black text-sunshine uppercase tracking-wider mb-1">Did you know?</p>
          <p className="text-sm font-bold text-white/90 leading-relaxed">{didYouKnow}</p>
        </div>

        <p className="text-sm font-bold text-white/70 leading-relaxed mb-4">
          While individual AI usage may seem small, awareness is the first step toward more sustainable
          practices. By understanding your footprint, you can make more informed choices about when and
          how you use AI tools.
        </p>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => navigate('/methodology')}
            className="flex items-center gap-2 px-4 py-2.5 bg-sunshine border-2 border-navy text-ink font-black text-xs uppercase tracking-wider hover:-translate-y-0.5 transition-transform"
          >
            See Methodology <ArrowRight size={12} />
          </button>
          <button
            onClick={() => navigate('/about')}
            className="flex items-center gap-2 px-4 py-2.5 bg-transparent border-2 border-white/30 text-white font-black text-xs uppercase tracking-wider hover:border-sunshine hover:text-sunshine transition-colors"
          >
            About OpenH2O
          </button>
        </div>
      </div>
    </div>
  );
}
