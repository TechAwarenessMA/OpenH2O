export default function ComparisonBadge({ emoji, title, description }) {
  return (
    <div className="flex items-start gap-3 p-4 rounded-xl bg-cream border border-navy/8 animate-fade-in-up transition-colors hover:bg-white">
      <span className="text-2xl leading-none mt-0.5 flex-shrink-0">{emoji}</span>
      <div>
        <p className="font-black text-sm text-navy tracking-tight">{title}</p>
        <p className="text-xs text-slate font-medium mt-0.5 leading-snug">{description}</p>
      </div>
    </div>
  );
}
