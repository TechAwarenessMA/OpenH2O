import { useMemo, useState } from 'react';
import { X, Zap, Droplets, Cloud, MessageSquare, ChevronDown, ChevronUp, AlertTriangle, Info, CheckCircle } from 'lucide-react';
import { COEFFICIENTS } from '../data/coefficients';
import { GPT_COEFFICIENTS } from '../data/gptCoefficients';
import { countTokens, extractText } from '../utils/tokenizer';
import { calculatePromptScore } from '../utils/promptScorer';
import { formatNumber, formatDate } from '../utils/formatters';
import { flattenChatGPTMessages } from '../utils/chatgptParser';

/** Extract text from a message object */
function getTextFromMsg(msg) {
  if (msg.content != null) {
    const text = extractText(msg.content);
    if (text) return text;
  }
  if (typeof msg.text === 'string') return msg.text;
  return '';
}

/** Compute per-message stats on demand */
function computeMessageStats(chatMessages, source) {
  const coeff = source === 'chatgpt' ? GPT_COEFFICIENTS : COEFFICIENTS;
  return chatMessages.map(msg => {
    const text = getTextFromMsg(msg);
    const tokens = countTokens(text);
    const sender = msg.sender || msg.role || 'unknown';
    const isInput = sender === 'human' || sender === 'user';
    const energyWh = (isInput
      ? tokens * coeff.energy_per_input_token_wh
      : tokens * coeff.energy_per_output_token_wh
    ) * coeff.pue_multiplier;

    return { sender, text, tokens, energyWh, isInput };
  });
}

/** Score color based on value */
function scoreColor(score) {
  if (score >= 70) return '#2ECC71';
  if (score >= 40) return '#FAC206';
  return '#FB4B5F';
}

/** Score label */
function scoreLabel(score) {
  if (score >= 80) return 'Excellent';
  if (score >= 70) return 'Good';
  if (score >= 50) return 'Average';
  if (score >= 30) return 'Needs Work';
  return 'Poor';
}

/** Small horizontal score bar */
function ScoreBar({ label, value }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-bold text-slate w-20 flex-shrink-0">{label}</span>
      <div className="flex-1 h-2 bg-navy/10 overflow-hidden">
        <div
          className="h-full transition-all duration-500"
          style={{ width: `${value}%`, background: scoreColor(value) }}
        />
      </div>
      <span className="text-xs font-black text-navy w-8 text-right">{value}</span>
    </div>
  );
}

/** Suggestion severity icon */
function SeverityIcon({ severity }) {
  if (severity === 'warning') return <AlertTriangle size={14} className="text-coral flex-shrink-0 mt-0.5" />;
  if (severity === 'success') return <CheckCircle size={14} className="text-green flex-shrink-0 mt-0.5" />;
  return <Info size={14} className="text-sky flex-shrink-0 mt-0.5" />;
}

function severityBorder(severity) {
  if (severity === 'warning') return 'border-coral';
  if (severity === 'success') return 'border-green';
  return 'border-sky';
}

export default function ConvoDetailPanel({ convo, rawConvo, onClose }) {
  const [showMessages, setShowMessages] = useState(false);

  const chatMessages = useMemo(() => {
    if (convo.source === 'chatgpt' && rawConvo.mapping) {
      return flattenChatGPTMessages(rawConvo.mapping);
    }
    return rawConvo.chat_messages || rawConvo.messages || [];
  }, [rawConvo, convo.source]);

  const messageStats = useMemo(
    () => computeMessageStats(chatMessages, convo.source),
    [chatMessages, convo.source]
  );

  const promptScore = useMemo(
    () => calculatePromptScore(chatMessages),
    [chatMessages]
  );

  const totalEnergyWh = convo.energyKwh * 1000;
  const waterMl = convo.waterLiters * 1000;
  const carbonMg = convo.carbonGrams * 1000;
  const inputPct = convo.totalTokens > 0 ? Math.round((convo.inputTokens / convo.totalTokens) * 100) : 0;
  const outputPct = 100 - inputPct;
  const avgTokensPerMsg = convo.messageCount > 0 ? Math.round(convo.totalTokens / convo.messageCount) : 0;

  const color = scoreColor(promptScore.overall);

  return (
    <div className="border-4 border-navy bg-white flex flex-col max-h-[calc(100vh-160px)] overflow-hidden"
      style={{ boxShadow: '4px 4px 0px 0px #2C3E50' }}
    >
      {/* ── Header ──────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-3 p-4 border-b-4 border-navy bg-cream flex-shrink-0">
        <div className="min-w-0">
          <h3 className="text-sm font-black text-navy leading-tight truncate">
            {convo.title || 'Untitled'}
          </h3>
          <p className="text-xs font-bold text-slate mt-0.5">
            <span className={`inline-block px-1.5 py-0.5 text-white font-black text-[10px] uppercase mr-1.5 ${convo.source === 'chatgpt' ? 'bg-[#10a37f]' : 'bg-[#d97706]'}`}>
              {convo.source === 'chatgpt' ? 'GPT' : 'Claude'}
            </span>
            {formatDate(convo.createdAt)} · {convo.messageCount} messages
          </p>
        </div>
        <button
          onClick={onClose}
          className="w-7 h-7 flex items-center justify-center border-2 border-navy/20 hover:border-coral hover:bg-coral/10 transition-colors flex-shrink-0"
          aria-label="Close detail panel"
        >
          <X size={14} />
        </button>
      </div>

      {/* ── Scrollable content ──────────────────────────────── */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">

        {/* ── Prompt Score Card ────────────────────────────── */}
        <div className="border-4 border-navy p-4" style={{ boxShadow: `4px 4px 0px 0px ${color}` }}>
          <p className="text-xs font-black text-slate uppercase tracking-wider mb-2">Prompt Optimization</p>
          <div className="flex items-end gap-3 mb-3">
            <span className="text-5xl font-black leading-none" style={{ color }}>
              {promptScore.overall}
            </span>
            <div>
              <span className="text-sm font-black" style={{ color }}>{scoreLabel(promptScore.overall)}</span>
              <span className="text-xs font-bold text-slate block">out of 100</span>
            </div>
          </div>
          <div className="space-y-1.5">
            <ScoreBar label="Conciseness" value={promptScore.breakdown.ratioScore} />
            <ScoreBar label="Length" value={promptScore.breakdown.lengthScore} />
            <ScoreBar label="Efficiency" value={promptScore.breakdown.turnScore} />
            <ScoreBar label="Specificity" value={promptScore.breakdown.specificityScore} />
          </div>
        </div>

        {/* ── Environmental Impact Grid ────────────────────── */}
        <div>
          <p className="text-xs font-black text-slate uppercase tracking-wider mb-2">Environmental Impact</p>
          <div className="grid grid-cols-2 gap-2">
            {[
              { icon: Zap, label: 'Energy', value: totalEnergyWh, unit: 'Wh', dec: 4, color: '#2ECC71' },
              { icon: Droplets, label: 'Water', value: waterMl, unit: 'mL', dec: 2, color: '#16C0FF' },
              { icon: Cloud, label: 'Carbon', value: carbonMg, unit: 'mg CO₂', dec: 2, color: '#FB4B5F' },
              { icon: MessageSquare, label: 'Tokens', value: convo.totalTokens, unit: 'total', dec: 0, color: '#2C3E50' },
            ].map(({ icon: Icon, label, value, unit, dec, color: c }) => (
              <div key={label} className="bg-cream border-2 border-navy/10 p-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <Icon size={12} style={{ color: c }} />
                  <span className="text-xs font-black text-slate uppercase tracking-wider">{label}</span>
                </div>
                <p className="text-lg font-black text-navy leading-tight">{formatNumber(value, dec)}</p>
                <p className="text-xs font-bold text-slate">{unit}</p>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2 mt-2">
            <div className="bg-cream border-2 border-navy/10 p-3">
              <p className="text-xs font-black text-slate uppercase tracking-wider mb-1">Avg / Message</p>
              <p className="text-sm font-black text-navy">{avgTokensPerMsg} tokens</p>
            </div>
            <div className="bg-cream border-2 border-navy/10 p-3">
              <p className="text-xs font-black text-slate uppercase tracking-wider mb-1">Input / Output</p>
              <p className="text-sm font-black text-navy">{formatNumber(convo.inputTokens)} / {formatNumber(convo.outputTokens)}</p>
            </div>
          </div>
        </div>

        {/* ── Token Split Bar ─────────────────────────────── */}
        <div>
          <p className="text-xs font-black text-slate uppercase tracking-wider mb-2">Token Split</p>
          <div className="h-5 border-4 border-navy flex overflow-hidden">
            <div className="bg-sky transition-all" style={{ width: `${inputPct}%` }} />
            <div className="bg-coral flex-1" />
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-xs font-black text-sky">Input {inputPct}%</span>
            <span className="text-xs font-black text-coral">Output {outputPct}%</span>
          </div>
        </div>

        {/* ── Improvement Suggestions ─────────────────────── */}
        <div>
          <p className="text-xs font-black text-slate uppercase tracking-wider mb-2">How to Improve</p>
          <div className="space-y-2">
            {promptScore.suggestions.map((s, i) => (
              <div key={i} className={`border-l-4 ${severityBorder(s.severity)} bg-cream p-3`}>
                <div className="flex items-start gap-2">
                  <SeverityIcon severity={s.severity} />
                  <div>
                    <p className="text-xs font-black text-navy">{s.title}</p>
                    <p className="text-xs font-bold text-slate leading-relaxed mt-0.5">{s.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Per-Message Stats (collapsible) ─────────────── */}
        <div>
          <button
            onClick={() => setShowMessages(v => !v)}
            className="flex items-center gap-2 text-xs font-black text-navy uppercase tracking-wider hover:text-green transition-colors w-full"
          >
            {showMessages ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            Message-Level Breakdown ({messageStats.length})
          </button>

          {showMessages && (
            <div className="mt-2 max-h-64 overflow-y-auto border-2 border-navy/10 divide-y divide-navy/5">
              {messageStats.map((m, i) => (
                <div key={i} className="flex items-start gap-2 p-2 text-xs">
                  <span className={`font-black flex-shrink-0 w-14 ${m.isInput ? 'text-sky' : 'text-coral'}`}>
                    {m.isInput ? 'You' : (convo.source === 'chatgpt' ? 'GPT' : 'Claude')}
                  </span>
                  <p className="text-slate font-bold flex-1 min-w-0 truncate" title={m.text}>
                    {m.text.slice(0, 80)}{m.text.length > 80 ? '...' : ''}
                  </p>
                  <span className="font-black text-navy flex-shrink-0">{m.tokens}t</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
