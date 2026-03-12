import { useNavigate } from 'react-router-dom';
import { useEcoData } from '../hooks/useEcoData';
import MetricCard from '../components/MetricCard';
import UsageChart from '../components/UsageChart';
import ComparisonBadge from '../components/ComparisonBadge';
import FunFact from '../components/FunFact';
import { Zap, Droplets, Cloud, TrendingUp, TreePine, Calendar, ArrowRight, AlertCircle, Activity } from 'lucide-react';
import { formatNumber } from '../utils/formatters';
import { getComparisons } from '../data/comparisons';

function getEfficiencyGrade(avgTokensPerConvo) {
  if (avgTokensPerConvo < 500)   return { grade: 'A+', label: 'Excellent', color: '#16c964', bg: 'rgba(22,201,100,0.1)',  ring: '#16c964' };
  if (avgTokensPerConvo < 1000)  return { grade: 'A',  label: 'Very Good', color: '#22c55e', bg: 'rgba(34,197,94,0.1)',   ring: '#22c55e' };
  if (avgTokensPerConvo < 2500)  return { grade: 'B',  label: 'Good',      color: '#F5B700', bg: 'rgba(245,183,0,0.1)',   ring: '#F5B700' };
  if (avgTokensPerConvo < 6000)  return { grade: 'C',  label: 'Average',   color: '#f97316', bg: 'rgba(249,115,22,0.1)',  ring: '#f97316' };
  if (avgTokensPerConvo < 12000) return { grade: 'D',  label: 'High Use',  color: '#ef4444', bg: 'rgba(239,68,68,0.1)',   ring: '#ef4444' };
  return                                { grade: 'F',  label: 'Very High',  color: '#FF4058', bg: 'rgba(255,64,88,0.12)',  ring: '#FF4058' };
}

function formatMonth(key) {
  if (!key) return '';
  const [y, m] = key.split('-');
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${months[parseInt(m, 10) - 1]} '${y.slice(2)}`;
}

export default function Dashboard() {
  const { hasData, totals, monthlyData, conversations } = useEcoData();
  const navigate = useNavigate();

  if (!hasData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-in text-center">
        <div className="w-16 h-16 rounded-2xl bg-navy/5 flex items-center justify-center mb-5">
          <Activity size={28} className="text-navy/30" />
        </div>
        <h2 className="text-2xl font-black text-navy mb-2">No data yet</h2>
        <p className="text-slate font-medium mb-6">Upload your conversations.json to see your impact.</p>
        <button
          onClick={() => navigate('/')}
          className="px-6 py-3 bg-navy text-white font-bold text-sm rounded-xl hover:bg-ink transition-colors flex items-center gap-2"
        >
          Upload Data <ArrowRight size={16} />
        </button>
      </div>
    );
  }

  const comparisons = getComparisons(totals);
  const avgTokensPerConvo = totals.totalTokens / totals.totalConversations;
  const efficiency = getEfficiencyGrade(avgTokensPerConvo);

  // Per-conversation averages
  const avgEnergyPerConvo  = totals.energyKwh    / totals.totalConversations;
  const avgWaterPerConvo   = totals.waterLiters   / totals.totalConversations;
  const avgCarbonPerConvo  = totals.carbonGrams   / totals.totalConversations;

  // Trees to offset (1 tree absorbs ~21,000 g CO₂/year)
  const treesToOffset = totals.carbonGrams / 21000;
  const treeDisplay = treesToOffset < 0.01
    ? `${(treesToOffset * 100).toFixed(2)}% of 1 tree`
    : treesToOffset < 1
      ? `${(treesToOffset * 100).toFixed(1)}% of 1 tree`
      : `${treesToOffset.toFixed(2)} trees`;

  // Peak month
  const peakMonth = monthlyData.length > 0
    ? monthlyData.reduce((max, m) => (m.tokens > max.tokens ? m : max))
    : null;

  // Months active
  const monthsActive = monthlyData.length;

  // Efficiency context text
  const efficiencyContext = {
    'A+': 'Your conversations are short and focused — you\'re using AI very efficiently.',
    'A':  'Great efficiency! Your average conversation length is well-managed.',
    'B':  'Solid usage patterns. Minor optimizations could reduce your footprint further.',
    'C':  'Your conversations tend to run long. Consider batching or summarizing earlier.',
    'D':  'Heavy usage detected. Review long conversations — shorter threads use less energy.',
    'F':  'Very intensive usage. Breaking up long conversations would significantly reduce impact.',
  };

  return (
    <div className="space-y-7 animate-fade-in-up">

      {/* ── HEADER ─────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl md:text-4xl font-black text-navy tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>
            Your AI Impact
          </h1>
          <p className="text-slate font-medium mt-1 text-sm">
            {formatNumber(totals.totalConversations)} conversations · {formatNumber(totals.totalTokens)} tokens · {monthsActive} {monthsActive === 1 ? 'month' : 'months'} tracked
          </p>
        </div>
        {/* Efficiency grade badge */}
        <div
          className="flex items-center gap-3 rounded-2xl px-4 py-3 border flex-shrink-0"
          style={{ background: efficiency.bg, borderColor: efficiency.ring + '40' }}
        >
          <div
            className="grade-ring"
            style={{ color: efficiency.ring, borderColor: efficiency.ring }}
          >
            <span className="grade-letter" style={{ color: efficiency.ring }}>{efficiency.grade}</span>
            <span className="grade-label" style={{ color: efficiency.ring }}>grade</span>
          </div>
          <div>
            <p className="font-black text-navy text-sm leading-tight">Efficiency Score</p>
            <p className="font-semibold text-xs mt-0.5" style={{ color: efficiency.color }}>{efficiency.label}</p>
            <p className="text-xs text-slate font-medium mt-0.5">{formatNumber(avgTokensPerConvo, 0)} tokens avg / convo</p>
          </div>
        </div>
      </div>

      {/* ── BIG 3 METRICS ──────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard icon={Zap}      label="Energy" value={formatNumber(totals.energyKwh, 4)} unit="kWh"    color="sunshine" comparison={comparisons.energy} />
        <MetricCard icon={Droplets} label="Water"  value={formatNumber(totals.waterLiters, 2)} unit="liters" color="sky"     comparison={comparisons.water} />
        <MetricCard icon={Cloud}    label="Carbon" value={formatNumber(totals.carbonGrams, 2)} unit="g CO₂" color="green"   comparison={comparisons.carbon} />
      </div>

      {/* ── PER-CONVERSATION AVERAGES ───────────────────────── */}
      <div className="section-card">
        <div className="section-card-header">
          <div className="section-card-icon" style={{ background: 'rgba(26,46,59,0.07)' }}>
            <TrendingUp size={16} className="text-navy" />
          </div>
          <h2 className="section-card-title">Per Conversation Average</h2>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="stat-mini">
            <span className="stat-mini-label">Energy / chat</span>
            <span className="stat-mini-value">{formatNumber(avgEnergyPerConvo, 5)}</span>
            <span className="stat-mini-unit">kWh</span>
          </div>
          <div className="stat-mini">
            <span className="stat-mini-label">Water / chat</span>
            <span className="stat-mini-value">{formatNumber(avgWaterPerConvo, 3)}</span>
            <span className="stat-mini-unit">liters</span>
          </div>
          <div className="stat-mini">
            <span className="stat-mini-label">Carbon / chat</span>
            <span className="stat-mini-value">{formatNumber(avgCarbonPerConvo, 3)}</span>
            <span className="stat-mini-unit">g CO₂</span>
          </div>
        </div>
        <p className="text-xs text-slate font-medium mt-3 leading-relaxed">
          {efficiencyContext[efficiency.grade]}
        </p>
      </div>

      {/* ── MONTHLY TIMELINE ───────────────────────────────── */}
      {monthlyData.length > 1 && (
        <div className="section-card">
          <div className="section-card-header">
            <div className="section-card-icon" style={{ background: 'rgba(0,190,255,0.1)' }}>
              <Calendar size={16} className="text-sky" />
            </div>
            <h2 className="section-card-title">Monthly Usage</h2>
            {peakMonth && (
              <div className="ml-auto text-right">
                <p className="text-xs text-slate font-medium">Peak month</p>
                <p className="text-sm font-black text-navy">{formatMonth(peakMonth.month)}</p>
              </div>
            )}
          </div>
          <UsageChart data={monthlyData} />
        </div>
      )}

      {/* ── CARBON OFFSET CONTEXT ──────────────────────────── */}
      <div className="trees-card">
        <span className="trees-emoji">🌳</span>
        <div>
          <p className="text-xs font-bold text-slate uppercase tracking-wider mb-0.5">Carbon Offset Equivalent</p>
          <p className="text-xl font-black text-navy leading-tight">{treeDisplay}</p>
          <p className="text-xs font-medium text-slate mt-1">
            One mature tree absorbs ~21 kg of CO₂ per year. Your {formatNumber(totals.carbonGrams, 1)} g CO₂ from AI usage
            would require a tree to grow for {treesToOffset < 0.01 ? 'just a few hours' : treesToOffset < 0.1 ? 'a few days' : treesToOffset < 1 ? `${Math.round(treesToOffset * 365)} days` : `${treesToOffset.toFixed(1)} years`} to offset.
          </p>
        </div>
      </div>

      {/* ── REAL-WORLD COMPARISONS ─────────────────────────── */}
      <div className="section-card">
        <div className="section-card-header">
          <div className="section-card-icon" style={{ background: 'rgba(245,183,0,0.12)' }}>
            <Activity size={16} className="text-sunshine" />
          </div>
          <h2 className="section-card-title">Real-World Comparisons</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {comparisons.badges.map((badge, i) => (
            <ComparisonBadge key={i} {...badge} />
          ))}
        </div>
      </div>

      {/* ── FUN FACTS ──────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FunFact totals={totals} conversations={conversations} />
      </div>

      {/* ── DISCLAIMER ─────────────────────────────────────── */}
      <div className="flex items-start gap-2.5 p-4 rounded-xl bg-white/60 border border-slate/10">
        <AlertCircle size={14} className="text-slate flex-shrink-0 mt-0.5" />
        <p className="text-xs text-slate font-medium leading-relaxed">
          These are estimates based on publicly available data about large language model energy usage.{' '}
          <button onClick={() => navigate('/methodology')} className="text-green font-bold underline underline-offset-2">
            See our methodology →
          </button>
        </p>
      </div>

    </div>
  );
}
