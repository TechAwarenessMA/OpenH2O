/**
 * Reduction tips with dynamic thresholds.
 * Tips are shown based on user's actual usage patterns.
 */

const TIP_TEMPLATES = [
  {
    title: 'Be concise in your prompts',
    description: 'Shorter, more focused prompts use fewer tokens. Try to be specific about what you need rather than providing extensive background.',
    category: 'prompt',
    always: true,
  },
  {
    title: 'Avoid unnecessary follow-ups',
    description: 'Plan your questions upfront. A single well-crafted prompt often works better than multiple back-and-forth messages.',
    category: 'prompt',
    always: true,
  },
  {
    title: 'Skip the pleasantries',
    description: 'While politeness is nice, "Please help me with X" and "Help me with X" produce the same result with fewer tokens.',
    category: 'prompt',
    always: true,
  },
  {
    title: 'Consider if AI is the right tool',
    description: 'For simple lookups or calculations, a search engine or calculator uses far less energy than an AI model.',
    category: 'usage',
    always: true,
  },
  {
    title: 'You have some long conversations',
    description: 'Your longest conversations use significantly more resources. Consider starting new conversations instead of extending existing ones.',
    category: 'pattern',
    condition: (totals, convos) => {
      const avg = totals.totalTokens / totals.totalConversations;
      return convos.some(c => c.totalTokens > avg * 3);
    },
  },
  {
    title: 'Heavy usage detected',
    description: 'You use AI quite frequently. Even small per-prompt efficiencies can add up significantly at your usage level.',
    category: 'pattern',
    condition: (totals) => totals.totalConversations > 100,
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
    .map(({ title, description, category }) => ({ title, description, category }));
}
