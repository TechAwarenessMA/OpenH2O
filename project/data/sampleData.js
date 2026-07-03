/**
 * Synthetic Claude-format export used by the "explore with sample data"
 * button on the landing screen. Shaped exactly like a real Claude
 * conversations.json so it flows through the normal processing pipeline.
 */

const TITLES = [
  'Debugging a React useEffect loop', 'Explain transformer attention', 'Trip itinerary for Japan',
  'Refactor Python data pipeline', 'Draft cover letter', 'SQL window functions help',
  'Meal plan for the week', 'Summarize research paper', 'CSS grid layout question',
  'Marketing email copy', 'Explain quantum entanglement', 'Fix failing unit tests',
  'Brainstorm startup names', 'Translate a paragraph', 'Resume bullet rewrites',
  'Regex for email parsing', 'History of the printing press', 'Budget spreadsheet formulas',
  'Explain Docker networking', 'Short story feedback', 'Interview prep questions',
  'Optimize a slow query', 'Plan a birthday party', 'Explain gradient descent',
  'Rewrite for clarity', 'Book recommendations', 'Kubernetes pod crash', 'Compose a poem',
  'Explain the bond market', 'Git rebase workflow', 'Design a REST API', 'Poster copy ideas',
  'Explain photosynthesis', 'Cover image prompt', 'Reduce AWS costs', 'Explain OAuth flow',
  'Weekly standup notes', 'Explain big-O notation', 'Wedding speech draft', 'CI pipeline setup',
];

const HUMAN_SNIPPETS = [
  'Can you help me understand why this keeps happening and how to fix it properly?',
  'I have a bit of code here that is not behaving the way I expect it to.',
  'Walk me through this step by step, I want to really understand the reasoning.',
  'What are the trade-offs between the different approaches you mentioned?',
  'Can you make this shorter and clearer without losing the key points?',
  'Give me a concrete example I can adapt to my own use case.',
];

const ASSISTANT_SNIPPETS = [
  'Great question. The core issue is that the dependency array is causing the effect to re-run on every render, which recreates the object and triggers the loop again. Here is a cleaner pattern that memoizes the value so the reference stays stable across renders.',
  'There are a few things going on here. First, the state update is asynchronous, so reading it immediately afterward gives you the previous value. Second, the closure captures the stale variable. Let me break down each part and show the corrected version with comments.',
  'Let me explain this carefully. At a high level, the mechanism works by weighting each input relative to every other input, then combining those weighted values. Concretely, you compute three projections, take a scaled dot product, apply a softmax, and use the result to mix the values together.',
  'Here is a tightened version that keeps the important details while cutting the filler. I removed the redundant qualifiers and merged the two overlapping points into one clearer sentence.',
  'Sure — a good example would be parsing a log file line by line, extracting the timestamp and level, and grouping the entries by hour so you can spot spikes. I have included a short, runnable snippet below.',
];

function pick(arr, i) { return arr[i % arr.length]; }

/** Build a Claude-format conversations.json spanning the last ~6 months. */
export function generateSampleRaw() {
  const now = new Date();
  const convos = [];
  for (let i = 0; i < TITLES.length; i++) {
    // spread across the last 6 months
    const monthsAgo = Math.floor((i / TITLES.length) * 6);
    const day = 1 + ((i * 7) % 27);
    const created = new Date(now.getFullYear(), now.getMonth() - (5 - monthsAgo), day, 9 + (i % 8), (i * 13) % 60);

    const turns = 1 + (i % 5); // 1–5 exchanges
    const messages = [];
    for (let t = 0; t < turns; t++) {
      const reps = 1 + ((i + t) % 3); // vary length so token counts differ
      messages.push({ sender: 'human', text: Array(reps).fill(pick(HUMAN_SNIPPETS, i + t)).join(' ') });
      messages.push({ sender: 'assistant', text: Array(reps + 1).fill(pick(ASSISTANT_SNIPPETS, i + t)).join(' ') });
    }

    convos.push({
      name: TITLES[i],
      created_at: created.toISOString(),
      chat_messages: messages,
    });
  }
  return convos;
}
