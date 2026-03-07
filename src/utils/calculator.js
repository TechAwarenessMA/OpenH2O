import { COEFFICIENTS } from '../data/coefficients';
import { countTokens } from './tokenizer';

/**
 * Calculate environmental impact for a given token count.
 * @param {number} tokens
 * @returns {{ energyKwh: number, waterLiters: number, carbonGrams: number }}
 */
function calcImpact(tokens) {
  const energyKwh = tokens * COEFFICIENTS.ENERGY_PER_TOKEN_KWH * COEFFICIENTS.PUE;
  const waterLiters = energyKwh * COEFFICIENTS.WATER_PER_KWH_LITERS;
  const carbonGrams = energyKwh * COEFFICIENTS.CARBON_PER_KWH_GRAMS;
  return { energyKwh, waterLiters, carbonGrams };
}

/**
 * Process a Claude conversations.json export.
 * @param {Array} rawConversations - The parsed JSON array
 * @returns {{ totals, conversations, monthlyData }}
 */
export function processConversations(rawConversations) {
  // Handle both array and object with array property
  let convos = rawConversations;
  if (!Array.isArray(convos)) {
    // Some exports wrap in an object
    convos = convos.conversations || convos.chat_messages || Object.values(convos);
    if (!Array.isArray(convos)) {
      throw new Error('Could not find conversations array in the uploaded file.');
    }
  }

  let totalTokens = 0;
  const monthlyBuckets = {};

  const conversations = convos.map((convo, index) => {
    const messages = convo.chat_messages || convo.messages || [];
    const title = convo.name || convo.title || `Conversation ${index + 1}`;
    const createdAt = convo.created_at || convo.create_time || null;

    let convoTokens = 0;
    let userTokens = 0;
    let assistantTokens = 0;

    for (const msg of messages) {
      const role = msg.sender || msg.role || 'unknown';
      const tokens = countTokens(msg.text || msg.content || '');
      convoTokens += tokens;
      if (role === 'human' || role === 'user') {
        userTokens += tokens;
      } else {
        assistantTokens += tokens;
      }
    }

    totalTokens += convoTokens;

    // Bucket by month
    if (createdAt) {
      const date = new Date(createdAt);
      if (!isNaN(date.getTime())) {
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        if (!monthlyBuckets[key]) {
          monthlyBuckets[key] = { month: key, tokens: 0, conversations: 0 };
        }
        monthlyBuckets[key].tokens += convoTokens;
        monthlyBuckets[key].conversations += 1;
      }
    }

    const impact = calcImpact(convoTokens);

    return {
      title,
      createdAt,
      messageCount: messages.length,
      totalTokens: convoTokens,
      userTokens,
      assistantTokens,
      ...impact,
    };
  });

  const totalsImpact = calcImpact(totalTokens);

  // Monthly data sorted chronologically
  const monthlyData = Object.values(monthlyBuckets)
    .sort((a, b) => a.month.localeCompare(b.month))
    .map(bucket => ({
      ...bucket,
      ...calcImpact(bucket.tokens),
    }));

  return {
    totals: {
      totalConversations: conversations.length,
      totalTokens,
      ...totalsImpact,
    },
    conversations: conversations.sort((a, b) => b.totalTokens - a.totalTokens),
    monthlyData,
  };
}
