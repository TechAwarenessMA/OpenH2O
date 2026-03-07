import { useNavigate } from 'react-router-dom';
import { useEcoData } from '../hooks/useEcoData';
import InsightTip from '../components/InsightTip';
import { getTips } from '../data/tips';
import { formatNumber } from '../utils/formatters';
import { getComparisons } from '../data/comparisons';
import { TrendingUp, Scale, Lightbulb, Globe } from 'lucide-react';

export default function Insights() {
  const { hasData, totals, conversations } = useEcoData();
  const navigate = useNavigate();

  if (!hasData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-in">
        <h2 className="text-2xl font-black text-navy mb-4">No data yet</h2>
        <p className="text-slate font-bold mb-6">Upload your conversations.json to see insights.</p>
        <button
          onClick={() => navigate('/')}
          className="px-6 py-3 bg-navy text-white font-black text-sm uppercase tracking-wider border-4 border-navy hover:bg-black transition-colors"
        >
          Upload Data
        </button>
      </div>
    );
  }

  const tips = getTips(totals, conversations);
  const comparisons = getComparisons(totals);

  // Compute usage patterns
  const avgTokensPerConvo = totals.totalTokens / totals.totalConversations;
  const sortedByTokens = [...conversations].sort((a, b) => b.totalTokens - a.totalTokens);
  const topConvo = sortedByTokens[0];

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div>
        <h1 className="text-3xl md:text-4xl font-black text-navy tracking-tight">Insights</h1>
        <p className="text-slate font-bold mt-1">Patterns, comparisons, and tips</p>
      </div>

      {/* Usage patterns */}
      <div className="border-4 border-navy bg-white p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 bg-sunshine flex items-center justify-center">
            <TrendingUp size={18} className="text-navy" />
          </div>
          <h2 className="text-lg font-black text-navy uppercase tracking-wider">Usage Patterns</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 bg-cream border-2 border-navy/10">
            <p className="text-xs font-black text-slate uppercase tracking-wider mb-1">Avg tokens per conversation</p>
            <p className="text-2xl font-black text-navy">{formatNumber(avgTokensPerConvo, 0)}</p>
          </div>
          {topConvo && (
            <div className="p-4 bg-cream border-2 border-navy/10">
              <p className="text-xs font-black text-slate uppercase tracking-wider mb-1">Most resource-intensive</p>
              <p className="text-sm font-black text-navy truncate">{topConvo.title || 'Untitled'}</p>
              <p className="text-xs text-slate font-bold">{formatNumber(topConvo.totalTokens)} tokens</p>
            </div>
          )}
        </div>
      </div>

      {/* Context comparisons */}
      <div className="border-4 border-navy bg-white p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 bg-sky flex items-center justify-center">
            <Scale size={18} className="text-navy" />
          </div>
          <h2 className="text-lg font-black text-navy uppercase tracking-wider">In Context</h2>
        </div>
        <div className="space-y-3">
          {comparisons.badges.map((badge, i) => (
            <div key={i} className="p-3 bg-cream border-2 border-navy/10 flex items-start gap-3">
              <span className="text-2xl">{badge.emoji}</span>
              <div>
                <p className="font-black text-sm text-navy">{badge.title}</p>
                <p className="text-xs text-slate font-bold">{badge.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tips */}
      <div className="border-4 border-navy bg-white p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 bg-green flex items-center justify-center">
            <Lightbulb size={18} className="text-navy" />
          </div>
          <h2 className="text-lg font-black text-navy uppercase tracking-wider">Reduction Tips</h2>
        </div>
        <div className="space-y-3">
          {tips.map((tip, i) => (
            <InsightTip key={i} {...tip} />
          ))}
        </div>
      </div>

      {/* Bigger picture */}
      <div className="border-4 border-navy bg-white p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 bg-coral flex items-center justify-center">
            <Globe size={18} className="text-white" />
          </div>
          <h2 className="text-lg font-black text-navy uppercase tracking-wider">The Bigger Picture</h2>
        </div>
        <div className="space-y-3 text-sm text-ink font-bold leading-relaxed">
          <p>
            AI's environmental impact is growing rapidly. Data centers already consume about 1-2% of global electricity,
            and AI workloads are among the most energy-intensive tasks these centers run.
          </p>
          <p>
            While individual usage may seem small, awareness is the first step toward more sustainable AI practices.
            By understanding your footprint, you can make more informed choices about when and how you use AI tools.
          </p>
          <p className="text-slate text-xs">
            These are estimates.{' '}
            <button onClick={() => navigate('/methodology')} className="text-green underline font-black">
              See our methodology →
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
