/**
 * OpenH2O core logic — ported from TechAwarenessMA/OpenH2O (MIT).
 * All calculation logic preserved. Token counting uses gpt-tokenizer
 * from CDN when reachable, with the original char/4 fallback otherwise.
 */

/* ── Coefficients (Claude Sonnet 4.6) ─────────────────────────── */
export const COEFFICIENTS = {
  version: '1.1',
  lastUpdated: 'March 2026',
  energy_per_output_token_wh: 0.000195,
  energy_per_input_token_wh: 0.0000039,
  pue_multiplier: 1.2,
  direct_water_per_kwh_liters: 1.9,
  indirect_water_per_kwh_liters: 4.5,
  carbon_per_kwh_gco2e: 340,
  model_label: 'Claude Sonnet 4.6',
  uncertainty_range_pct: 50,
  sources: {
    energy: ['Luccioni et al. 2023, "Power Hungry Processing"', '2024 United States Data Center Energy Usage Report'],
    pue: 'Anthropic datacenter estimate; industry avg 1.1–1.5',
    water: ['EESI 2024, direct cooling: 1,900 L/MWh', '2024 United States Data Center Energy Usage Report'],
    carbon: ['EPA eGRID 2023, US national average', '2024 United States Data Center Energy Usage Report'],
  },
};

/* ── Coefficients (GPT-5) ─────────────────────────────────────── */
export const GPT_COEFFICIENTS = {
  version: '1.0',
  lastUpdated: 'March 2026',
  energy_per_output_token_wh: 0.004,
  energy_per_input_token_wh: 0.00008,
  pue_multiplier: 1.2,
  direct_water_per_kwh_liters: 1.9,
  indirect_water_per_kwh_liters: 4.5,
  carbon_per_kwh_gco2e: 340,
  model_label: 'GPT-5',
  uncertainty_range_pct: 50,
  sources: {
    energy: ['Epoch AI, "How much energy does ChatGPT use?" (2025)', "Tom's Hardware, GPT-5 power consumption estimates (2025)"],
    pue: 'Industry avg 1.1–1.5; OpenAI uses similar hyperscaler PUE',
    water: ['EESI 2024, direct cooling: 1,900 L/MWh', '2024 United States Data Center Energy Usage Report'],
    carbon: ['EPA eGRID 2023, US national average', '2024 United States Data Center Energy Usage Report'],
  },
};

/* ── Tokenizer ────────────────────────────────────────────────── */
let _encode = null;

/** Try to load gpt-tokenizer from CDN; falls back to char/4 estimate. */
export async function initTokenizer() {
  if (_encode) return;
  try {
    const m = await import('https://cdn.jsdelivr.net/npm/gpt-tokenizer@2/+esm');
    if (m && typeof m.encode === 'function') _encode = m.encode;
  } catch { /* offline — use fallback */ }
}

export function countTokens(text) {
  if (!text || typeof text !== 'string') return 0;
  if (_encode) {
    try { return _encode(text).length; } catch { /* fall through */ }
  }
  return Math.ceil(text.length / 4);
}

export function extractText(content) {
  if (typeof content === 'string') return content;
  if (!Array.isArray(content)) return '';
  const parts = [];
  for (const block of content) {
    if (!block) continue;
    if (block.type === 'text' && block.text) {
      parts.push(block.text);
    } else if (block.type === 'tool_result' && block.content) {
      const nested = extractText(block.content);
      if (nested) parts.push(nested);
    }
  }
  return parts.join(' ');
}

/* ── ChatGPT export parser ────────────────────────────────────── */
function extractChatGPTText(content) {
  if (!content || !content.parts) return '';
  return content.parts.filter(p => typeof p === 'string').join(' ').trim();
}

export function flattenChatGPTMessages(mapping) {
  if (!mapping || typeof mapping !== 'object') return [];
  let rootId = null;
  for (const [id, node] of Object.entries(mapping)) {
    if (!node.parent || !mapping[node.parent]) { rootId = id; break; }
  }
  if (!rootId) return [];
  const messages = [];
  let currentId = rootId;
  while (currentId) {
    const node = mapping[currentId];
    if (!node) break;
    if (node.message) {
      const msg = node.message;
      const role = msg.author?.role;
      if (role && role !== 'system' && role !== 'tool') {
        const text = extractChatGPTText(msg.content);
        if (text) messages.push({ role, text, create_time: msg.create_time || 0 });
      }
    }
    const children = node.children;
    currentId = children && children.length > 0 ? children[children.length - 1] : null;
  }
  return messages;
}

export function normalizeChatGPTConversation(rawConvo) {
  const title = rawConvo.title || 'Untitled';
  let createdAt = null;
  if (rawConvo.create_time) createdAt = new Date(rawConvo.create_time * 1000).toISOString();
  const messages = flattenChatGPTMessages(rawConvo.mapping);
  return { title, createdAt, messages };
}

export function isChatGPTFormat(json) {
  const arr = Array.isArray(json) ? json : json?.conversations || [];
  if (!Array.isArray(arr) || arr.length === 0) return false;
  return arr[0]?.mapping != null && typeof arr[0].mapping === 'object';
}

/* ── Calculator ───────────────────────────────────────────────── */
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

function getMessageText(msg) {
  if (msg.content != null) {
    const text = extractText(msg.content);
    if (text) return text;
  }
  if (typeof msg.text === 'string') return msg.text;
  return '';
}

export function detectFormat(json) {
  return isChatGPTFormat(json) ? 'chatgpt' : 'claude';
}

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

    const humanTexts = [];
    const assistantTexts = [];
    for (const msg of messages) {
      const sender = msg.sender || msg.role || 'unknown';
      const text = (typeof msg.text === 'string' && msg.text) ? msg.text : getMessageText(msg);
      if (!text) continue;
      if (sender === 'human' || sender === 'user') humanTexts.push(text);
      else if (sender === 'assistant') assistantTexts.push(text);
    }

    const inputTokens = countTokens(humanTexts.join(' '));
    const outputTokens = countTokens(assistantTexts.join(' '));

    totalInputTokens += inputTokens;
    totalOutputTokens += outputTokens;
    totalMessages += messages.length;

    if (createdAt) {
      const date = new Date(createdAt);
      if (!isNaN(date.getTime())) {
        if (!earliestDate || date < earliestDate) earliestDate = date;
        if (!latestDate || date > latestDate) latestDate = date;
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        if (!monthlyBuckets[key]) {
          monthlyBuckets[key] = { month: key, tokens: 0, inputTokens: 0, outputTokens: 0, conversations: 0 };
        }
        monthlyBuckets[key].tokens += inputTokens + outputTokens;
        monthlyBuckets[key].inputTokens += inputTokens;
        monthlyBuckets[key].outputTokens += outputTokens;
        monthlyBuckets[key].conversations += 1;
      }
    }

    const impact = calcImpact(inputTokens, outputTokens, coeff);

    return {
      title, createdAt,
      messageCount: messages.length,
      totalTokens: inputTokens + outputTokens,
      inputTokens, outputTokens,
      source: format,
      ...impact,
    };
  });

  const totalsImpact = calcImpact(totalInputTokens, totalOutputTokens, coeff);
  const totalTokens = totalInputTokens + totalOutputTokens;

  const monthlyData = Object.values(monthlyBuckets)
    .sort((a, b) => a.month.localeCompare(b.month))
    .map(bucket => ({ ...bucket, ...calcImpact(bucket.inputTokens, bucket.outputTokens, coeff) }));

  return {
    source: format,
    totals: {
      totalConversations: conversations.length,
      totalMessages, totalTokens,
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

  const dates = [a.dateRange.earliest, a.dateRange.latest, b.dateRange.earliest, b.dateRange.latest]
    .filter(Boolean).map(d => new Date(d));
  const earliest = dates.length > 0 ? new Date(Math.min(...dates)).toISOString() : null;
  const latest = dates.length > 0 ? new Date(Math.max(...dates)).toISOString() : null;

  return { totals, conversations, monthlyData, dateRange: { earliest, latest } };
}

/* ── Real-world comparisons ───────────────────────────────────── */
const COMPARISON_DEFS = {
  ledHours:          { perUnit: 0.01, singular: 'hour of LED light',    plural: 'hours of LED light',    title: 'LED Bulb Hours' },
  laptopHours:       { perUnit: 0.05, singular: 'hour of laptop use',   plural: 'hours of laptop use',   title: 'Laptop Hours' },
  waterBottles:      { perUnit: 0.5,  singular: 'water bottle',         plural: 'water bottles',         title: 'Water Bottles' },
  showerMinutes:     { perUnit: 8,    singular: 'minute of showering',  plural: 'minutes of showering',  title: 'Shower Time' },
  milesDriven:       { perUnit: 404,  singular: 'mile driven',          plural: 'miles driven',          title: 'Miles Driven' },
  smartphoneCharges: { perUnit: 8.22, singular: 'smartphone charge',    plural: 'smartphone charges',    title: 'Smartphone Charges' },
};

export function getComparisons(totals) {
  const compare = (value, def) => {
    const count = value / def.perUnit;
    return {
      count,
      title: def.title,
      description: `Equivalent to ${formatCompare(count)} ${count === 1 ? def.singular : def.plural}`,
    };
  };
  const led     = compare(totals.energyKwh,   COMPARISON_DEFS.ledHours);
  const laptop  = compare(totals.energyKwh,   COMPARISON_DEFS.laptopHours);
  const bottles = compare(totals.waterLiters, COMPARISON_DEFS.waterBottles);
  const shower  = compare(totals.waterLiters, COMPARISON_DEFS.showerMinutes);
  const miles   = compare(totals.carbonGrams, COMPARISON_DEFS.milesDriven);
  const phone   = compare(totals.carbonGrams, COMPARISON_DEFS.smartphoneCharges);
  return {
    energy: `~${formatCompare(led.count)} hours of LED light`,
    water: `~${formatCompare(bottles.count)} water bottles`,
    carbon: `~${formatCompare(miles.count)} miles driven`,
    badges: [led, laptop, bottles, shower, miles, phone],
  };
}

export function formatCompare(n) {
  if (n < 0.01) return n.toFixed(4);
  if (n < 1) return n.toFixed(2);
  if (n < 100) return n.toFixed(1);
  return Math.round(n).toLocaleString();
}

/* ── Reduction tips ───────────────────────────────────────────── */
const TIP_TEMPLATES = [
  {
    title: 'Be concise in your prompts',
    description: 'Shorter, more focused prompts use fewer tokens. Try to be specific about what you need rather than providing extensive background.',
    category: 'prompt', always: true,
  },
  {
    title: 'Avoid unnecessary follow-ups',
    description: 'Plan your questions upfront. A single well-crafted prompt often works better than multiple back-and-forth messages.',
    category: 'prompt', always: true,
  },
  {
    title: 'Skip the pleasantries',
    description: 'While politeness is nice, "Please help me with X" and "Help me with X" produce the same result with fewer tokens.',
    category: 'prompt', always: true,
  },
  {
    title: 'Consider if AI is the right tool',
    description: 'For simple lookups or calculations, a search engine or calculator uses far less energy than an AI model.',
    category: 'usage', always: true,
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

export function getTips(totals, conversations) {
  return TIP_TEMPLATES
    .filter(tip => tip.always || (tip.condition && tip.condition(totals, conversations)))
    .map(({ title, description, category }) => ({ title, description, category }));
}

/* ── Formatters ───────────────────────────────────────────────── */
export function formatNumber(n, decimals) {
  if (n == null || isNaN(n)) return '0';
  if (decimals !== undefined) {
    if (n > 0 && n < 0.001) return n.toExponential(2);
    return n.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: decimals });
  }
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
  if (n < 0.01 && n > 0) return n.toExponential(2);
  if (Number.isInteger(n)) return n.toLocaleString();
  return n.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

export function formatDate(dateStr) {
  if (!dateStr) return 'Unknown';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return 'Unknown';
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

export function formatMonth(monthKey) {
  const [year, month] = monthKey.split('-');
  const d = new Date(parseInt(year), parseInt(month) - 1);
  return d.toLocaleDateString(undefined, { year: '2-digit', month: 'short' });
}

/* ── CSV export ───────────────────────────────────────────────── */
export function exportConversationsCSV(conversations) {
  const headers = ['Title', 'Date', 'Source', 'Messages', 'Total Tokens', 'Input Tokens', 'Output Tokens', 'Energy (kWh)', 'Water (L)', 'Carbon (g CO2e)'];
  const escape = (v) => {
    const s = String(v ?? '');
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const rows = conversations.map(c => [
    c.title, c.createdAt || '', c.source || '', c.messageCount,
    c.totalTokens, c.inputTokens, c.outputTokens,
    c.energyKwh.toFixed(8), c.waterLiters.toFixed(6), c.carbonGrams.toFixed(6),
  ].map(escape).join(','));
  const csv = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'openh2o-conversations.csv';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/* ── Sample data (for previewing the redesign without an export) ─ */
function mulberry32(seed) {
  return function () {
    seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const SAMPLE_TITLES = [
  'Debugging a React useEffect loop', 'College essay feedback', 'Trip itinerary: Kyoto in 5 days',
  'SQL query optimization', 'Cover letter draft', "Explain transformers like I'm 12",
  'Meal prep plan for the week', 'Regex for email validation', 'History homework: Cold War',
  'Python web scraper', 'Resume bullet points', 'Startup name brainstorm',
  'Calculus derivative help', 'Git rebase disaster', 'Wedding toast draft',
  'API rate limiting design', 'Book recommendations: sci-fi', 'Spanish conversation practice',
  'CSS grid layout help', 'Physics: projectile motion', 'Marketing email rewrite',
  'D&D campaign ideas', 'Thesis statement workshop', 'Docker compose networking',
  'Interview prep: system design', 'Budget spreadsheet formulas', "Poem for mom's birthday",
  'TypeScript generics confusion', 'Garden planning: zone 6', 'Negotiating a job offer',
];

export function generateSampleResult() {
  const rand = mulberry32(20260702);
  const months = ['2025-10', '2025-11', '2025-12', '2026-01', '2026-02', '2026-03', '2026-04', '2026-05', '2026-06'];
  const monthWeights = [0.5, 0.7, 0.6, 1.0, 1.1, 1.4, 1.2, 1.6, 1.3];

  const conversations = [];
  const monthlyBuckets = {};
  let totalInput = 0, totalOutput = 0, totalMessages = 0;
  let totalEnergy = 0, totalWater = 0, totalCarbon = 0;
  let earliest = null, latest = null;

  months.forEach((month, mi) => {
    const count = Math.round(8 + monthWeights[mi] * 12 * rand() + monthWeights[mi] * 6);
    monthlyBuckets[month] = { month, tokens: 0, inputTokens: 0, outputTokens: 0, conversations: 0, energyKwh: 0, waterLiters: 0, carbonGrams: 0 };

    for (let i = 0; i < count; i++) {
      const source = rand() < 0.28 ? 'chatgpt' : 'claude';
      const coeff = source === 'chatgpt' ? GPT_COEFFICIENTS : COEFFICIENTS;
      const inputTokens = Math.round(120 + Math.pow(rand(), 2) * 4200);
      const outputTokens = Math.round(inputTokens * (1.6 + rand() * 2.8));
      const roundtrips = Math.max(1, Math.round(1 + rand() * 9));
      const messageCount = roundtrips * 2;

      const [y, mo] = month.split('-').map(Number);
      const day = 1 + Math.floor(rand() * 27);
      const date = new Date(y, mo - 1, day, Math.floor(rand() * 23), Math.floor(rand() * 59));
      if (!earliest || date < earliest) earliest = date;
      if (!latest || date > latest) latest = date;

      const impact = calcImpact(inputTokens, outputTokens, coeff);
      const title = SAMPLE_TITLES[Math.floor(rand() * SAMPLE_TITLES.length)];

      conversations.push({
        title, createdAt: date.toISOString(),
        messageCount,
        totalTokens: inputTokens + outputTokens,
        inputTokens, outputTokens, source,
        ...impact,
      });

      totalInput += inputTokens;
      totalOutput += outputTokens;
      totalMessages += messageCount;
      totalEnergy += impact.energyKwh;
      totalWater += impact.waterLiters;
      totalCarbon += impact.carbonGrams;

      const b = monthlyBuckets[month];
      b.tokens += inputTokens + outputTokens;
      b.inputTokens += inputTokens;
      b.outputTokens += outputTokens;
      b.conversations += 1;
      b.energyKwh += impact.energyKwh;
      b.waterLiters += impact.waterLiters;
      b.carbonGrams += impact.carbonGrams;
    }
  });

  return {
    sources: ['claude', 'chatgpt'],
    totals: {
      totalConversations: conversations.length,
      totalMessages,
      totalTokens: totalInput + totalOutput,
      inputTokens: totalInput,
      outputTokens: totalOutput,
      energyKwh: totalEnergy,
      waterLiters: totalWater,
      carbonGrams: totalCarbon,
    },
    conversations: conversations.sort((a, b) => b.totalTokens - a.totalTokens),
    monthlyData: Object.values(monthlyBuckets).sort((a, b) => a.month.localeCompare(b.month)),
    dateRange: { earliest: earliest.toISOString(), latest: latest.toISOString() },
    isSample: true,
  };
}
