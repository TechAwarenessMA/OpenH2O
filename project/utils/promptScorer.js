import { extractText } from './tokenizer';

/**
 * Extract plain text from a message object.
 * Handles Claude export format (content blocks) and fallback to msg.text.
 */
function getTextFromMessage(msg) {
  if (msg.content != null) {
    const text = extractText(msg.content);
    if (text) return text;
  }
  if (typeof msg.text === 'string') return msg.text;
  return '';
}

/**
 * Score how "specific" the human prompts are based on pattern matching.
 * Checks for question marks, action verbs, and absence of filler.
 */
function scoreSpecificity(humanTexts) {
  if (humanTexts.length === 0) return 50;

  const specificPatterns = [
    /\?/,
    /\bexplain\b/i, /\blist\b/i, /\bcompare\b/i,
    /step.?by.?step/i, /\bhow\s+to\b/i, /\bwhat\s+is\b/i,
    /\bprovide\b/i, /\bgenerate\b/i, /\bcreate\b/i,
    /\bwrite\b/i, /\banalyze\b/i, /\bsummarize\b/i,
    /\bimplement\b/i, /\bdesign\b/i, /\brefactor\b/i,
    /\bdebug\b/i, /\bfix\b/i, /\boptimize\b/i,
  ];
  const fillerPatterns = [
    /\bum+\b/i, /\buh+\b/i, /\bidk\b/i,
    /\bI\s+guess\b/i, /\bI\s+don'?t\s+know\b/i,
    /\bmaybe\s+you\s+could\b/i,
  ];

  let specificCount = 0;
  let fillerCount = 0;
  for (const text of humanTexts) {
    if (specificPatterns.some(p => p.test(text))) specificCount++;
    if (fillerPatterns.some(p => p.test(text))) fillerCount++;
  }

  const specificRatio = specificCount / humanTexts.length;
  const fillerRatio = fillerCount / humanTexts.length;
  return Math.max(0, Math.min(100, Math.round(specificRatio * 100 - fillerRatio * 30 + 30)));
}

/**
 * Generate actionable suggestions based on sub-scores.
 */
function generateSuggestions(scores, data) {
  const suggestions = [];

  if (scores.ratioScore < 50) {
    suggestions.push({
      type: 'ratio',
      severity: 'warning',
      title: 'Reduce prompt verbosity',
      description: `Your prompts use ${Math.round(data.ratio * 100)}% as many characters as the responses. State what you need directly without excessive context or preamble.`,
    });
  }

  if (scores.lengthScore < 50 && data.avgLen > 500) {
    suggestions.push({
      type: 'length',
      severity: 'warning',
      title: 'Shorten your prompts',
      description: `Average prompt length is ${Math.round(data.avgLen)} characters. Break complex requests into focused, single-purpose prompts to save tokens.`,
    });
  }

  if (scores.lengthScore < 50 && data.avgLen < 30) {
    suggestions.push({
      type: 'length',
      severity: 'info',
      title: 'Add more specificity',
      description: 'Prompts average under 30 characters. Adding specific requirements upfront reduces follow-up turns and total token usage.',
    });
  }

  if (scores.turnScore < 40) {
    suggestions.push({
      type: 'turns',
      severity: 'warning',
      title: 'Consolidate your requests',
      description: 'This conversation has many short exchanges. Combine related questions into a single detailed prompt to save tokens and energy.',
    });
  }

  if (scores.specificityScore < 50) {
    suggestions.push({
      type: 'specificity',
      severity: 'info',
      title: 'Use more targeted language',
      description: 'Try action verbs like "explain", "list", "compare", or "analyze" to get focused responses with fewer wasted tokens.',
    });
  }

  if (data.ratio > 0.8 && data.humanTexts.length > 3) {
    suggestions.push({
      type: 'context',
      severity: 'info',
      title: 'Avoid repeating context',
      description: 'If you re-state context across turns, the model already has it in the conversation. Reference earlier messages instead of repeating.',
    });
  }

  if (suggestions.length === 0) {
    suggestions.push({
      type: 'success',
      severity: 'success',
      title: 'Well-optimized prompts',
      description: 'This conversation shows efficient prompting patterns. Your prompts are concise and produce good output relative to input.',
    });
  }

  return suggestions;
}

/**
 * Calculate a prompt optimization score (0-100) for a conversation.
 *
 * @param {Array} chatMessages - Raw chat_messages array from Claude export
 * @returns {{ overall: number, breakdown: Object, suggestions: Array }}
 */
export function calculatePromptScore(chatMessages) {
  if (!chatMessages || chatMessages.length === 0) {
    return {
      overall: 50,
      breakdown: { ratioScore: 50, lengthScore: 50, turnScore: 50, specificityScore: 50 },
      suggestions: [{ type: 'info', severity: 'info', title: 'No messages found', description: 'This conversation has no analyzable messages.' }],
    };
  }

  const humanTexts = [];
  const assistantTexts = [];

  for (const msg of chatMessages) {
    const sender = msg.sender || msg.role || 'unknown';
    const text = getTextFromMessage(msg);
    if (!text) continue;
    if (sender === 'human' || sender === 'user') humanTexts.push(text);
    else if (sender === 'assistant') assistantTexts.push(text);
  }

  if (humanTexts.length === 0) {
    return {
      overall: 50,
      breakdown: { ratioScore: 50, lengthScore: 50, turnScore: 50, specificityScore: 50 },
      suggestions: [{ type: 'info', severity: 'info', title: 'No user messages', description: 'Could not find user prompts to analyze.' }],
    };
  }

  const totalInputChars = humanTexts.reduce((s, t) => s + t.length, 0);
  const totalOutputChars = assistantTexts.reduce((s, t) => s + t.length, 0);

  // 1. Input/Output Ratio (30%) — lower ratio = more efficient
  const ratio = totalOutputChars > 0 ? totalInputChars / totalOutputChars : 1;
  const ratioScore = ratio <= 0.1 ? 100 : ratio >= 1.0 ? 0 : Math.round(100 * (1 - (ratio - 0.1) / 0.9));

  // 2. Average Prompt Length (25%) — sweet spot 50-300 chars
  const avgLen = totalInputChars / humanTexts.length;
  let lengthScore;
  if (avgLen < 20) lengthScore = 20;
  else if (avgLen <= 300) lengthScore = 100;
  else if (avgLen <= 800) lengthScore = Math.round(100 - ((avgLen - 300) / 500) * 60);
  else lengthScore = 20;

  // 3. Turn Efficiency (25%) — output chars per human turn
  const outputPerTurn = totalOutputChars / humanTexts.length;
  const turnScore = Math.min(100, Math.round((outputPerTurn / 800) * 100));

  // 4. Specificity (20%) — pattern matching
  const specificityScore = scoreSpecificity(humanTexts);

  const overall = Math.max(0, Math.min(100, Math.round(
    ratioScore * 0.30 +
    lengthScore * 0.25 +
    turnScore * 0.25 +
    specificityScore * 0.20
  )));

  const breakdown = { ratioScore, lengthScore, turnScore, specificityScore };
  const suggestions = generateSuggestions(breakdown, { ratio, avgLen, outputPerTurn, humanTexts });

  return { overall, breakdown, suggestions };
}
