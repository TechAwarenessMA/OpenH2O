import { formatNumber } from '../utils/formatters';

export default function FunFact({ totals, conversations }) {
  const avgTokens = totals.totalTokens / totals.totalConversations;
  const longestConvo = conversations[0]; // already sorted by tokens desc

  const facts = [
    {
      emoji: '📊',
      text: `Your average conversation uses ${formatNumber(avgTokens, 0)} tokens`,
    },
    longestConvo && {
      emoji: '🏆',
      text: `Your longest conversation ("${longestConvo.title?.slice(0, 30) || 'Untitled'}") used ${formatNumber(longestConvo.totalTokens)} tokens`,
    },
    totals.totalConversations > 10 && {
      emoji: '💬',
      text: `You've had ${formatNumber(totals.totalConversations)} conversations with AI`,
    },
  ].filter(Boolean);

  return (
    <>
      {facts.map((fact, i) => (
        <div key={i} className="border-4 border-sunshine bg-sunshine/10 p-4 flex items-start gap-3 animate-fade-in-up">
          <span className="text-2xl">{fact.emoji}</span>
          <p className="text-sm font-bold text-navy">{fact.text}</p>
        </div>
      ))}
    </>
  );
}
