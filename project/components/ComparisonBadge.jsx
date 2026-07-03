export default function ComparisonBadge({ emoji, title, description }) {
  return (
    <div className="border-4 border-navy bg-white p-4 flex items-start gap-3 animate-fade-in-up">
      <span className="text-3xl">{emoji}</span>
      <div>
        <p className="font-black text-sm text-navy uppercase tracking-wider">{title}</p>
        <p className="text-xs text-slate font-bold mt-1">{description}</p>
      </div>
    </div>
  );
}
