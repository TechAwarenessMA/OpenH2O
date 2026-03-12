import { useNavigate } from 'react-router-dom';
import { useEcoData } from '../hooks/useEcoData';
import { getTips } from '../data/tips';
import { formatNumber } from '../utils/formatters';
import { getComparisons } from '../data/comparisons';
import {
  TrendingUp, Scale, Lightbulb, Globe, Leaf,
  Cpu, Zap, MessageSquare, Search, Clock,
  ArrowRight, Activity, Target, Server
} from 'lucide-react';

// ── Local AI solutions data ──────────────────────────────────
const ECO_SOLUTIONS = [
  {
    emoji: '🦙',
    name: 'Ollama',
    tags: ['Local', 'Free', 'Open Source'],
    description: 'Run Llama, Mistral, Gemma, and dozens of other powerful models completely offline on your own hardware. Zero cloud energy per query after download.',
    benefit: '~100% less cloud energy',
    link: 'https://ollama.ai',
  },
  {
    emoji: '🖥️',
    name: 'LM Studio',
    tags: ['Local', 'Free', 'Visual UI'],
    description: 'Beautiful desktop app for discovering and running any GGUF model locally. Features a familiar ChatGPT-style interface with full privacy.',
    benefit: 'No data ever leaves device',
    link: 'https://lmstudio.ai',
  },
  {
    emoji: '🔒',
    name: 'Jan.ai',
    tags: ['Local', 'Private', 'Open Source'],
    description: 'Open-source alternative to ChatGPT that runs 100% on-device. Your conversations stay completely private — no accounts, no telemetry.',
    benefit: 'Air-gapped privacy',
    link: 'https://jan.ai',
  },
  {
    emoji: '📦',
    name: 'GPT4All',
    tags: ['Local', 'Offline', 'Free'],
    description: 'Download once, run forever — completely offline. Designed for non-technical users who want private AI without any subscription or internet connection.',
    benefit: 'Works without internet',
    link: 'https://gpt4all.io',
  },
  {
    emoji: '⚡',
    name: 'Use Smaller Models',
    tags: ['Efficient', 'Cloud OK', 'API'],
    description: 'Claude Haiku uses roughly 5× less energy than Claude Sonnet or Opus for most everyday tasks. Match model size to task complexity — bigger isn\'t always better.',
    benefit: 'Up to 5× less energy',
  },
  {
    emoji: '🔍',
    name: 'Search First',
    tags: ['Habit', 'Fastest', 'Lowest Impact'],
    description: 'A Google or Perplexity search uses ~0.0003 Wh — roughly 10,000× less energy than an LLM response. For factual lookups, a search engine is almost always the right tool.',
    benefit: '10,000× less energy/query',
  },
];

// ── Mindful usage strategies ──────────────────────────────────
const MINDFUL_STRATEGIES = [
  {
    icon: Target,
    title: 'Set a weekly query budget',
    description: 'Decide intentionally how many AI conversations you\'ll have per week. Writing it down creates awareness and reduces mindless usage.',
    difficulty: 'easy',
    iconBg: 'rgba(22,201,100,0.12)',
    iconColor: '#16c964',
  },
  {
    icon: MessageSquare,
    title: 'Batch related questions',
    description: 'Instead of multiple short back-and-forth conversations, compile related questions into one well-structured prompt. Reduces session overhead significantly.',
    difficulty: 'easy',
    iconBg: 'rgba(0,190,255,0.12)',
    iconColor: '#00BEFF',
  },
  {
    icon: Search,
    title: 'Use search engines for facts',
    description: 'For simple lookups, dates, conversions, or factual questions — a search engine uses ~10,000× less energy. Reach for AI only when you truly need generation.',
    difficulty: 'easy',
    iconBg: 'rgba(245,183,0,0.12)',
    iconColor: '#F5B700',
  },
  {
    icon: Clock,
    title: 'Summarize, don\'t regenerate',
    description: 'Ask AI to summarize existing content rather than produce entirely new content when possible. Shorter output prompts consume far fewer tokens.',
    difficulty: 'easy',
    iconBg: 'rgba(22,201,100,0.12)',
    iconColor: '#16c964',
  },
  {
    icon: Zap,
    title: 'Use templates for repeat tasks',
    description: 'If you find yourself prompting AI for the same type of task repeatedly, save high-quality outputs as templates. Reuse human-curated content instead of re-generating.',
    difficulty: 'medium',
    iconBg: 'rgba(249,115,22,0.12)',
    iconColor: '#f97316',
  },
  {
    icon: Cpu,
    title: 'Right-size your model choice',
    description: 'Most everyday tasks (summarizing, formatting, drafting short emails) work perfectly with small, efficient models. Save the powerful (energy-hungry) models for genuinely complex reasoning.',
    difficulty: 'medium',
    iconBg: 'rgba(0,190,255,0.12)',
    iconColor: '#00BEFF',
  },
];

const difficultyClass = {
  easy:   'difficulty-easy',
  medium: 'difficulty-medium',
  hard:   'difficulty-hard',
};

const categoryConfig = {
  prompt:  { bg: 'rgba(22,201,100,0.12)',  color: '#16c964', icon: Lightbulb },
  usage:   { bg: 'rgba(0,190,255,0.12)',   color: '#00BEFF', icon: TrendingUp },
  pattern: { bg: 'rgba(245,183,0,0.12)',   color: '#F5B700', icon: MessageSquare },
};

export default function Insights() {
  const { hasData, totals, conversations } = useEcoData();
  const navigate = useNavigate();

  if (!hasData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-in text-center">
        <div className="w-16 h-16 rounded-2xl bg-navy/5 flex items-center justify-center mb-5">
          <Lightbulb size={28} className="text-navy/30" />
        </div>
        <h2 className="text-2xl font-black text-navy mb-2">No data yet</h2>
        <p className="text-slate font-medium mb-6">Upload your conversations.json to see insights.</p>
        <button
          onClick={() => navigate('/')}
          className="px-6 py-3 bg-navy text-white font-bold text-sm rounded-xl hover:bg-ink transition-colors flex items-center gap-2"
        >
          Upload Data <ArrowRight size={16} />
        </button>
      </div>
    );
  }

  const tips = getTips(totals, conversations);
  const comparisons = getComparisons(totals);

  const avgTokensPerConvo = totals.totalTokens / totals.totalConversations;
  const sortedByTokens = [...conversations].sort((a, b) => b.totalTokens - a.totalTokens);
  const topConvo = sortedByTokens[0];
  const topHeavyCount = sortedByTokens.filter(c => c.totalTokens > avgTokensPerConvo * 2).length;

  return (
    <div className="space-y-7 animate-fade-in-up">

      {/* ── HEADER ─────────────────────────────────────────── */}
      <div>
        <h1 className="text-3xl md:text-4xl font-black text-navy tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>
          Insights
        </h1>
        <p className="text-slate font-medium mt-1 text-sm">Patterns, context, and paths to lower impact</p>
      </div>

      {/* ── USAGE PATTERNS ─────────────────────────────────── */}
      <div className="section-card">
        <div className="section-card-header">
          <div className="section-card-icon" style={{ background: 'rgba(245,183,0,0.12)' }}>
            <TrendingUp size={16} className="text-sunshine" />
          </div>
          <h2 className="section-card-title">Usage Patterns</h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="stat-mini">
            <span className="stat-mini-label">Avg tokens / chat</span>
            <span className="stat-mini-value">{formatNumber(avgTokensPerConvo, 0)}</span>
          </div>
          <div className="stat-mini">
            <span className="stat-mini-label">Total conversations</span>
            <span className="stat-mini-value">{formatNumber(totals.totalConversations, 0)}</span>
          </div>
          <div className="stat-mini">
            <span className="stat-mini-label">Total tokens</span>
            <span className="stat-mini-value">{formatNumber(totals.totalTokens / 1000, 1)}<span className="stat-mini-unit">K</span></span>
          </div>
          <div className="stat-mini">
            <span className="stat-mini-label">Heavy conversations</span>
            <span className="stat-mini-value">{topHeavyCount}</span>
            <span className="stat-mini-unit">above 2× avg</span>
          </div>
        </div>

        {topConvo && (
          <div className="mt-4 p-3.5 rounded-xl bg-cream border border-navy/8 flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-coral/10 flex items-center justify-center flex-shrink-0">
              <Activity size={14} className="text-coral" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate uppercase tracking-wider mb-0.5">Most resource-intensive chat</p>
              <p className="text-sm font-black text-navy truncate">{topConvo.title || 'Untitled'}</p>
              <p className="text-xs text-slate font-medium">{formatNumber(topConvo.totalTokens)} tokens · {formatNumber(topConvo.totalTokens * 0.000003 * 390, 3)} g CO₂</p>
            </div>
          </div>
        )}
      </div>

      {/* ── IN CONTEXT ─────────────────────────────────────── */}
      <div className="section-card">
        <div className="section-card-header">
          <div className="section-card-icon" style={{ background: 'rgba(0,190,255,0.12)' }}>
            <Scale size={16} className="text-sky" />
          </div>
          <h2 className="section-card-title">In Context</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {comparisons.badges.map((badge, i) => (
            <div key={i} className="flex items-start gap-3 p-3.5 rounded-xl bg-cream border border-navy/8">
              <span className="text-2xl leading-none mt-0.5">{badge.emoji}</span>
              <div>
                <p className="font-black text-sm text-navy">{badge.title}</p>
                <p className="text-xs text-slate font-medium mt-0.5 leading-snug">{badge.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── REDUCTION TIPS ──────────────────────────────────── */}
      <div className="section-card">
        <div className="section-card-header">
          <div className="section-card-icon" style={{ background: 'rgba(22,201,100,0.12)' }}>
            <Lightbulb size={16} className="text-green" />
          </div>
          <h2 className="section-card-title">Quick Wins: Prompt Efficiency</h2>
        </div>
        <div className="space-y-2.5">
          {tips.map((tip, i) => {
            const cat = categoryConfig[tip.category] || categoryConfig.prompt;
            const CatIcon = cat.icon;
            return (
              <div key={i} className="tip-card">
                <div className="tip-icon-wrap" style={{ background: cat.bg }}>
                  <CatIcon size={14} style={{ color: cat.color }} />
                </div>
                <div className="tip-content">
                  <div className="tip-title-row">
                    <p className="tip-title">{tip.title}</p>
                    <span className={difficultyClass[tip.difficulty] || 'difficulty-easy'}>
                      {tip.difficulty || 'easy'}
                    </span>
                  </div>
                  <p className="tip-desc">{tip.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── HOW TO REDUCE USAGE ─────────────────────────────── */}
      <div className="section-card">
        <div className="section-card-header">
          <div className="section-card-icon" style={{ background: 'rgba(249,115,22,0.12)' }}>
            <Target size={16} className="text-[#f97316]" />
          </div>
          <h2 className="section-card-title">Reduce Your AI Usage</h2>
        </div>
        <p className="text-sm text-slate font-medium mb-4 -mt-1 leading-relaxed">
          Behavioral changes have the largest impact. These strategies go beyond individual prompts.
        </p>
        <div className="space-y-2.5">
          {MINDFUL_STRATEGIES.map((s, i) => {
            const SIcon = s.icon;
            return (
              <div key={i} className="tip-card">
                <div className="tip-icon-wrap" style={{ background: s.iconBg }}>
                  <SIcon size={14} style={{ color: s.iconColor }} />
                </div>
                <div className="tip-content">
                  <div className="tip-title-row">
                    <p className="tip-title">{s.title}</p>
                    <span className={difficultyClass[s.difficulty]}>
                      {s.difficulty}
                    </span>
                  </div>
                  <p className="tip-desc">{s.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── ECO-FRIENDLY AI SOLUTIONS ───────────────────────── */}
      <div className="section-card">
        <div className="section-card-header">
          <div className="section-card-icon" style={{ background: 'rgba(22,201,100,0.12)' }}>
            <Leaf size={16} className="text-green" />
          </div>
          <h2 className="section-card-title">Eco-Friendly AI Alternatives</h2>
        </div>
        <p className="text-sm text-slate font-medium mb-4 -mt-1 leading-relaxed">
          The most sustainable AI query is one that never hits a data center. Local models run entirely on your device — no cloud energy, no network calls, full privacy.
        </p>

        <div className="eco-solutions-grid">
          {ECO_SOLUTIONS.map((solution, i) => (
            <div key={i} className="eco-card">
              <span className="eco-card-emoji">{solution.emoji}</span>
              <p className="eco-card-name">{solution.name}</p>
              <div className="eco-card-tags">
                {solution.tags.map((tag, j) => (
                  <span key={j} className="eco-card-tag">{tag}</span>
                ))}
              </div>
              <p className="eco-card-desc">{solution.description}</p>
              <div className="flex items-center justify-between gap-2 mt-auto">
                <span className="eco-card-benefit">✓ {solution.benefit}</span>
                {solution.link && (
                  <a
                    href={solution.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-bold text-slate hover:text-green transition-colors flex items-center gap-1"
                    onClick={e => e.stopPropagation()}
                  >
                    Visit <ArrowRight size={10} />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 p-3.5 rounded-xl border border-green/20 bg-green/5 flex items-start gap-2.5">
          <Server size={14} className="text-green flex-shrink-0 mt-0.5" />
          <p className="text-xs text-slate font-medium leading-relaxed">
            <strong className="text-navy">Getting started with local AI:</strong> Ollama is the easiest starting point — one command to install, then{' '}
            <code className="bg-navy/8 px-1 py-0.5 rounded text-[10px] font-mono">ollama run llama3.2</code>{' '}
            to chat. Suitable models run well on most laptops made in the last 5 years.
          </p>
        </div>
      </div>

      {/* ── THE BIGGER PICTURE ──────────────────────────────── */}
      <div className="section-card">
        <div className="section-card-header">
          <div className="section-card-icon" style={{ background: 'rgba(255,64,88,0.1)' }}>
            <Globe size={16} className="text-coral" />
          </div>
          <h2 className="section-card-title">The Bigger Picture</h2>
        </div>
        <div className="space-y-3.5">
          <div className="p-4 rounded-xl bg-gradient-to-r from-navy/5 to-transparent border border-navy/8">
            <p className="text-sm font-semibold text-ink leading-relaxed">
              AI's environmental impact is growing faster than most realize. Data centers already consume <strong>1–2% of global electricity</strong>,
              and generative AI workloads are among the most energy-intensive tasks these centers run. Projections suggest AI could account for
              <strong> 4–6% of global electricity</strong> by 2030.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-gradient-to-r from-green/5 to-transparent border border-green/15">
            <p className="text-sm font-semibold text-ink leading-relaxed">
              While individual usage seems small, collective awareness drives change. Companies respond to user pressure, and developers
              are building more efficient models precisely because efficiency is becoming a differentiator. <strong>Every conscious choice matters.</strong>
            </p>
          </div>
          <div className="p-4 rounded-xl bg-gradient-to-r from-sky/5 to-transparent border border-sky/15">
            <p className="text-sm font-semibold text-ink leading-relaxed">
              Water usage is the hidden story. AI data centers often use water-intensive cooling systems. A single large training run can consume
              millions of liters — and ongoing inference (your conversations) adds up too. The good news: facilities powered by renewables and using
              ambient air cooling dramatically reduce this footprint.
            </p>
          </div>
          <p className="text-xs text-slate font-medium">
            These are estimates.{' '}
            <button onClick={() => navigate('/methodology')} className="text-green font-bold underline underline-offset-2">
              See our methodology →
            </button>
          </p>
        </div>
      </div>

    </div>
  );
}
