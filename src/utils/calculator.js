import { COEFFICIENTS } from '../data/coefficients';
import { countTokens, extractText } from './tokenizer';

/**
 * Calculate environmental impact from input and output token counts.
 *
 * Formula (from spec Section 3.4):
 *   rawEnergy_wh  = (inputTokens × energy_per_input_token_wh)
 *                  + (outputTokens × energy_per_output_token_wh)
 *   totalEnergy_wh  = rawEnergy_wh × pue_multiplier
 *   totalEnergy_kwh = totalEnergy_wh / 1000
 *   water_liters    = totalEnergy_kwh × water_per_kwh_liters
 *   carbon_gco2e    = totalEnergy_kwh × carbon_per_kwh_gco2e
 *
 * @param {number} inputTokens  - Tokens from sender === 'human'
 * @param {number} outputTokens - Tokens from sender === 'assistant'
 * @returns {{ energyKwh: number, waterLiters: number, carbonGrams: number }}
 */
function calcImpact(inputTokens, outputTokens) {
  // Step 2: Raw energy (Wh)
  const rawEnergyWh =
    (inputTokens * COEFFICIENTS.energy_per_input_token_wh) +
    (outputTokens * COEFFICIENTS.energy_per_output_token_wh);

  // Step 3: Apply PUE and convert to kWh
  const totalEnergyWh = rawEnergyWh * COEFFICIENTS.pue_multiplier;
  const energyKwh = totalEnergyWh / 1000;

  // Step 4: Water & Carbon
  const waterLiters = energyKwh * (COEFFICIENTS.direct_water_per_kwh_liters + COEFFICIENTS.indirect_water_per_kwh_liters);
  const carbonGrams = energyKwh * COEFFICIENTS.carbon_per_kwh_gco2e;

  return { energyKwh, waterLiters, carbonGrams };
}

/**
 * Extract text from a single message object.
 * Handles Claude export format: message.content is array of content blocks.
 * Falls back to message.text for alternative formats.
 *
 * Robust against edge cases:
 *   content: null, content: [], content with only tool_use blocks,
 *   content: '' — all fall back to msg.text if available.
 *
 * @param {Object} msg - A chat message object
 * @returns {string} Plain text content
 */
function getMessageText(msg) {
  // Claude export: content is array of { type, text } blocks
  if (msg.content != null) {
    const text = extractText(msg.content);
    if (text) return text;
  }
  // Fallback for alternative formats or when content extraction yields nothing
  if (typeof msg.text === 'string') return msg.text;
  return '';
}

/**
 * Process a Claude conversations.json export.
 *
 * Tokenization follows spec Section 3.2:
 *   inputTokens  = encode(humanMessages.join(' ')).length
 *   outputTokens = encode(assistantMessages.join(' ')).length
 *
 * @param {Array|Object} rawConversations - The parsed JSON (array or wrapper object)
 * @returns {{ totals, conversations, monthlyData, dateRange }}
 */
export function processConversations(rawConversations) {
  // Handle both array and object with array property
  let convos = rawConversations;
  if (!Array.isArray(convos)) {
    convos = convos.conversations || convos.chat_messages || Object.values(convos);
    if (!Array.isArray(convos)) {
      throw new Error('Could not find conversations array in the uploaded file.');
    }
  }

  let totalInputTokens = 0;
  let totalOutputTokens = 0;
  let totalMessages = 0;
  let earliestDate = null;
  let latestDate = null;
  const monthlyBuckets = {};

  const conversations = convos.map((convo, index) => {
    const messages = convo.chat_messages || convo.messages || [];
    const title = convo.name || convo.title || `Conversation ${index + 1}`;
    const createdAt = convo.created_at || convo.create_time || null;

    // Step 1: Collect all human and assistant message texts separately
    const humanTexts = [];
    const assistantTexts = [];

    for (const msg of messages) {
      const sender = msg.sender || msg.role || 'unknown';
      const text = getMessageText(msg);
      if (!text) continue;

      if (sender === 'human' || sender === 'user') {
        humanTexts.push(text);
      } else if (sender === 'assistant') {
        assistantTexts.push(text);
      }
    }

    // Step 1 (spec): Join all texts per role, then tokenize once
    const inputTokens = countTokens(humanTexts.join(' '));
    const outputTokens = countTokens(assistantTexts.join(' '));

    totalInputTokens += inputTokens;
    totalOutputTokens += outputTokens;
    totalMessages += messages.length;

    // Track date range
    if (createdAt) {
      const date = new Date(createdAt);
      if (!isNaN(date.getTime())) {
        if (!earliestDate || date < earliestDate) earliestDate = date;
        if (!latestDate || date > latestDate) latestDate = date;

        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        if (!monthlyBuckets[key]) {
          monthlyBuckets[key] = {
            month: key,
            tokens: 0,
            inputTokens: 0,
            outputTokens: 0,
            conversations: 0,
          };
        }
        monthlyBuckets[key].tokens += inputTokens + outputTokens;
        monthlyBuckets[key].inputTokens += inputTokens;
        monthlyBuckets[key].outputTokens += outputTokens;
        monthlyBuckets[key].conversations += 1;
      }
    }

    // Steps 2–4: Calculate energy, water, carbon
    const impact = calcImpact(inputTokens, outputTokens);

    return {
      title,
      createdAt,
      messageCount: messages.length,
      totalTokens: inputTokens + outputTokens,
      inputTokens,
      outputTokens,
      ...impact,
    };
  });

  // Aggregate totals using the same formula
  const totalsImpact = calcImpact(totalInputTokens, totalOutputTokens);
  const totalTokens = totalInputTokens + totalOutputTokens;

  // Monthly data sorted chronologically
  const monthlyData = Object.values(monthlyBuckets)
    .sort((a, b) => a.month.localeCompare(b.month))
    .map(bucket => ({
      ...bucket,
      ...calcImpact(bucket.inputTokens, bucket.outputTokens),
    }));

  return {
    totals: {
      totalConversations: conversations.length,
      totalMessages,
      totalTokens,
      inputTokens: totalInputTokens,
      outputTokens: totalOutputTokens,
      ...totalsImpact,
    },
    conversations: conversations.sort((a, b) => b.totalTokens - a.totalTokens),
    monthlyData,
    dateRange: {
      earliest: earliestDate ? earliestDate.toISOString() : null,
      latest: latestDate ? latestDate.toISOString() : null,
    },
  };
}
