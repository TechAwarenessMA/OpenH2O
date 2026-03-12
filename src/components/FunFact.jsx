import { formatNumber } from '../utils/formatters';

export default function FunFact({ totals, conversations }) {
  const avgTokens = totals.totalTokens / totals.totalConversations;
  const longestConvo = conversations[0]; // already sorted by tokens desc

  const facts = [
    {
      emoji: '📊',
      label: 'Average conversation',
      value: `${formatNumber(avgTokens, 0)} tokens`,
    },
    longestConvo && {
      emoji: '🏆',
      label: 'Longest conversation',
      value: `${formatNumber(longestConvo.totalTokens)} tokens`,
      sub: `"${longestConvo.title?.slice(0, 28) || 'Untitled'}"`,
    },
    totals.totalConversations > 10 && {
      emoji: '💬',
      label: 'Total AI conversations',
      value: formatNumber(totals.totalConversations),
    },
  ].filter(Boolean);

  return (
    <>
      {facts.map((fact, i) => (
        <div
          key={i}
          className="flex items-start gap-3.5 p-4 rounded-xl bg-white border border-sunshine/25 shadow-sm animate-fade-in-up"
          style={{ boxShadow: '0 2px 12px rgba(245,183,0,0.08)' }}
        >
          <span className="text-2xl leading-none mt-0.5 flex-shrink-0">{fact.emoji}</span>
          <div>
            <p className="text-xs font-bold text-slate uppercase tracking-wider mb-0.5">{fact.label}</p>
            <p className="text-base font-black text-navy leading-tight">{fact.value}</p>
            {fact.sub && <p className="text-xs text-slate font-medium mt-0.5 truncate">{fact.sub}</p>}
          </div>
        </div>
      ))}
    </>
  );
}
