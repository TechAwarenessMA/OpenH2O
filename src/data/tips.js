/**
 * Reduction tips with dynamic thresholds and difficulty ratings.
 * Tips are shown based on user's actual usage patterns.
 */

const TIP_TEMPLATES = [
  {
    title: 'Write concise, focused prompts',
    description: 'Every extra sentence in your prompt is extra tokens in the response. State exactly what you need — specific, short prompts outperform vague lengthy ones and use fewer resources.',
    category: 'prompt',
    difficulty: 'easy',
    always: true,
  },
  {
    title: 'Front-load your request',
    description: 'Put the core ask first, then add context. AI models don\'t benefit from build-up. "Summarize this in 3 bullets:" is better than two paragraphs of preamble before the ask.',
    category: 'prompt',
    difficulty: 'easy',
    always: true,
  },
  {
    title: 'Skip the pleasantries',
    description: '"Help me with X" and "Could you please kindly help me with X?" produce identical output — but the latter wastes tokens. Being direct is both more efficient and more effective.',
    category: 'prompt',
    difficulty: 'easy',
    always: true,
  },
  {
    title: 'Ask once, not iteratively',
    description: 'Plan your questions before you start. A single well-structured prompt with all constraints specified upfront almost always outperforms a five-message back-and-forth.',
    category: 'prompt',
    difficulty: 'medium',
    always: true,
  },
  {
    title: 'Ask for shorter outputs explicitly',
    description: 'Unless you need long-form content, tell the model your desired length. "In 2–3 sentences" or "max 200 words" dramatically reduces output tokens — and output tokens are expensive.',
    category: 'prompt',
    difficulty: 'easy',
    always: true,
  },
  {
    title: 'Consider if AI is the right tool',
    description: 'Google search uses ~0.0003 Wh — roughly 10,000× less than an LLM response. For factual lookups, definitions, simple math, or navigation — a search engine or calculator is almost always faster and greener.',
    category: 'usage',
    difficulty: 'easy',
    always: true,
  },
  {
    title: 'Start fresh instead of extending',
    description: 'Long conversation threads carry the entire history as context on every message. Starting a new focused conversation when you change topics is more efficient than one mega-thread.',
    category: 'pattern',
    difficulty: 'easy',
    condition: (totals, convos) => {
      const avg = totals.totalTokens / totals.totalConversations;
      return convos.some(c => c.totalTokens > avg * 3);
    },
  },
  {
    title: 'Heavy usage detected — small habits compound',
    description: 'At your usage volume, even modest per-prompt improvements accumulate significantly. A 20% reduction in average tokens means a 20% reduction in your entire footprint.',
    category: 'pattern',
    difficulty: 'medium',
    condition: (totals) => totals.totalConversations > 100,
  },
  {
    title: 'Use system prompts wisely',
    description: 'If you use the API or a custom interface, keep system prompts lean. A bloated system prompt gets appended to every single message — small inefficiencies multiply rapidly at scale.',
    category: 'usage',
    difficulty: 'hard',
    condition: (totals) => totals.totalConversations > 50,
  },
];

/**
 * Get applicable tips for the user's data.
 * @param {{ totalTokens: number, totalConversations: number }} totals
 * @param {Array} conversations
 */
export function getTips(totals, conversations) {
  return TIP_TEMPLATES
    .filter(tip => tip.always || (tip.condition && tip.condition(totals, conversations)))
    .map(({ title, description, category, difficulty }) => ({ title, description, category, difficulty }));
}
