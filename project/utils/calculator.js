import { COEFFICIENTS } from '../data/coefficients';
import { GPT_COEFFICIENTS } from '../data/gptCoefficients';
import { countTokens, extractText } from './tokenizer';
import { isChatGPTFormat, normalizeChatGPTConversation } from './chatgptParser';

/**
 * Calculate environmental impact from input and output token counts.
 *
 * @param {number} inputTokens
 * @param {number} outputTokens
 * @param {Object} coeff - Coefficients object (COEFFICIENTS or GPT_COEFFICIENTS)
 * @returns {{ energyKwh: number, waterLiters: number, carbonGrams: number }}
 */
function calcImpact(inputTokens, outputTokens, coeff) {
  const rawEnergyWh =
    (inputTokens * coeff.energy_per_input_token_wh) +
    (outputTokens * coeff.energy_per_output_token_wh);

  const totalEnergyWh = rawEnergyWh * coeff.pue_multiplier;
  const energyKwh = totalEnergyWh / 1000;

  const waterLiters = energyKwh * (coeff.direct_water_per_kwh_liters + coeff.indirect_water_per_kwh_liters);
  const carbonGrams = energyKwh * coeff.carbon_per_kwh_gco2e;

  return { energyKwh, waterLiters, carbonGrams };
}

/**
 * Extract text from a single Claude message object.
 * Handles Claude export format: message.content is array of content blocks.
 * Falls back to message.text for alternative formats.
 */
function getMessageText(msg) {
  if (msg.content != null) {
    const text = extractText(msg.content);
    if (text) return text;
  }
  if (typeof msg.text === 'string') return msg.text;
  return '';
}

/**
 * Detect the format of the uploaded JSON.
 * @param {Array|Object} json
 * @returns {'chatgpt' | 'claude'}
 */
export function detectFormat(json) {
  return isChatGPTFormat(json) ? 'chatgpt' : 'claude';
}

/**
 * Get the conversations array from raw JSON.
 */
function getConvosArray(rawConversations) {
  let convos = rawConversations;
  if (!Array.isArray(convos)) {
    convos = convos.conversations || convos.chat_messages || Object.values(convos);
    if (!Array.isArray(convos)) {
      throw new Error('Could not find conversations array in the uploaded file.');
    }
  }
  return convos;
}

/**
 * Process conversations from a single source (Claude or ChatGPT).
 *
 * @param {Array|Object} rawConversations - The parsed JSON
 * @returns {{ totals, conversations, monthlyData, dateRange, source }}
 */
export function processConversations(rawConversations) {
  const format = detectFormat(rawConversations);
  const coeff = format === 'chatgpt' ? GPT_COEFFICIENTS : COEFFICIENTS;
  const rawConvos = getConvosArray(rawConversations);

  let totalInputTokens = 0;
  let totalOutputTokens = 0;
  let totalMessages = 0;
  let earliestDate = null;
  let latestDate = null;
  const monthlyBuckets = {};

  const conversations = rawConvos.map((rawConvo, index) => {
    let title, createdAt, messages;

    if (format === 'chatgpt') {
      const normalized = normalizeChatGPTConversation(rawConvo);
      title = normalized.title;
      createdAt = normalized.createdAt;
      messages = normalized.messages;
    } else {
      messages = rawConvo.chat_messages || rawConvo.messages || [];
      title = rawConvo.name || rawConvo.title || `Conversation ${index + 1}`;
      createdAt = rawConvo.created_at || rawConvo.create_time || null;
    }

    // Collect human and assistant texts
    const humanTexts = [];
    const assistantTexts = [];

    for (const msg of messages) {
      const sender = msg.sender || msg.role || 'unknown';
      const text = (typeof msg.text === 'string' && msg.text) ? msg.text : getMessageText(msg);
      if (!text) continue;

      if (sender === 'human' || sender === 'user') {
        humanTexts.push(text);
      } else if (sender === 'assistant') {
        assistantTexts.push(text);
      }
    }

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

    const impact = calcImpact(inputTokens, outputTokens, coeff);

    return {
      title,
      createdAt,
      messageCount: messages.length,
      totalTokens: inputTokens + outputTokens,
      inputTokens,
      outputTokens,
      source: format,
      ...impact,
    };
  });

  const totalsImpact = calcImpact(totalInputTokens, totalOutputTokens, coeff);
  const totalTokens = totalInputTokens + totalOutputTokens;

  const monthlyData = Object.values(monthlyBuckets)
    .sort((a, b) => a.month.localeCompare(b.month))
    .map(bucket => ({
      ...bucket,
      ...calcImpact(bucket.inputTokens, bucket.outputTokens, coeff),
    }));

  return {
    source: format,
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

/**
 * Merge two processed results into one combined result.
 */
export function mergeResults(a, b) {
  const totals = {
    totalConversations: a.totals.totalConversations + b.totals.totalConversations,
    totalMessages: a.totals.totalMessages + b.totals.totalMessages,
    totalTokens: a.totals.totalTokens + b.totals.totalTokens,
    inputTokens: a.totals.inputTokens + b.totals.inputTokens,
    outputTokens: a.totals.outputTokens + b.totals.outputTokens,
    energyKwh: a.totals.energyKwh + b.totals.energyKwh,
    waterLiters: a.totals.waterLiters + b.totals.waterLiters,
    carbonGrams: a.totals.carbonGrams + b.totals.carbonGrams,
  };

  const conversations = [...a.conversations, ...b.conversations]
    .sort((x, y) => y.totalTokens - x.totalTokens);

  // Merge monthly data
  const bucketMap = {};
  for (const bucket of [...a.monthlyData, ...b.monthlyData]) {
    if (!bucketMap[bucket.month]) {
      bucketMap[bucket.month] = { ...bucket };
    } else {
      const existing = bucketMap[bucket.month];
      existing.tokens += bucket.tokens;
      existing.inputTokens += bucket.inputTokens;
      existing.outputTokens += bucket.outputTokens;
      existing.conversations += bucket.conversations;
      existing.energyKwh += bucket.energyKwh;
      existing.waterLiters += bucket.waterLiters;
      existing.carbonGrams += bucket.carbonGrams;
    }
  }
  const monthlyData = Object.values(bucketMap).sort((x, y) => x.month.localeCompare(y.month));

  // Expand date range
  const dates = [a.dateRange.earliest, a.dateRange.latest, b.dateRange.earliest, b.dateRange.latest]
    .filter(Boolean)
    .map(d => new Date(d));
  const earliest = dates.length > 0 ? new Date(Math.min(...dates)).toISOString() : null;
  const latest = dates.length > 0 ? new Date(Math.max(...dates)).toISOString() : null;

  return {
    totals,
    conversations,
    monthlyData,
    dateRange: { earliest, latest },
  };
}
