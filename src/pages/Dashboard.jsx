import { useNavigate } from 'react-router-dom';
import { useEcoData } from '../hooks/useEcoData';
import MetricCard from '../components/MetricCard';
import UsageChart from '../components/UsageChart';
import ComparisonBadge from '../components/ComparisonBadge';
import FunFact from '../components/FunFact';
import { Zap, Droplets, Cloud } from 'lucide-react';
import { formatNumber } from '../utils/formatters';
import { getComparisons } from '../data/comparisons';

export default function Dashboard() {
  const { hasData, totals, monthlyData, conversations } = useEcoData();
  const navigate = useNavigate();

  if (!hasData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-in">
        <h2 className="text-2xl font-black text-navy mb-4">No data yet</h2>
        <p className="text-slate font-bold mb-6">Upload your conversations.json to see your impact.</p>
        <button
          onClick={() => navigate('/')}
          className="px-6 py-3 bg-navy text-white font-black text-sm uppercase tracking-wider border-4 border-navy hover:bg-black transition-colors"
        >
          Upload Data
        </button>
      </div>
    );
  }

  const comparisons = getComparisons(totals);

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Header */}
      <div>
        <h1 className="text-3xl md:text-4xl font-black text-navy tracking-tight">Your AI Impact</h1>
        <p className="text-slate font-bold mt-1">
          Based on {formatNumber(totals.totalConversations)} conversations with {formatNumber(totals.totalTokens)} tokens
        </p>
      </div>

      {/* Big 3 Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard
          icon={Zap}
          label="Energy"
          value={formatNumber(totals.energyKwh, 4)}
          unit="kWh"
          color="sunshine"
          comparison={comparisons.energy}
        />
        <MetricCard
          icon={Droplets}
          label="Water"
          value={formatNumber(totals.waterLiters, 2)}
          unit="liters"
          color="sky"
          comparison={comparisons.water}
        />
        <MetricCard
          icon={Cloud}
          label="Carbon"
          value={formatNumber(totals.carbonGrams, 2)}
          unit="g CO₂"
          color="green"
          comparison={comparisons.carbon}
        />
      </div>

      {/* Monthly timeline chart */}
      {monthlyData.length > 1 && (
        <div className="border-4 border-navy bg-white p-6">
          <h2 className="text-lg font-black text-navy uppercase tracking-wider mb-4">Monthly Usage</h2>
          <UsageChart data={monthlyData} />
        </div>
      )}

      {/* Comparison badges */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {comparisons.badges.map((badge, i) => (
          <ComparisonBadge key={i} {...badge} />
        ))}
      </div>

      {/* Fun facts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FunFact totals={totals} conversations={conversations} />
      </div>

      {/* Disclaimer */}
      <div className="p-3 border-2 border-slate/20 bg-white/50">
        <p className="text-xs text-slate font-bold">
          These are estimates based on publicly available data.{' '}
          <button onClick={() => navigate('/methodology')} className="text-green underline font-black">
            See our methodology →
          </button>
        </p>
      </div>
    </div>
  );
}
