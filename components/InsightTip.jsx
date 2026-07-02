import { Lightbulb, TrendingUp, MessageSquare } from 'lucide-react';

const categoryIcons = {
  prompt: Lightbulb,
  usage: TrendingUp,
  pattern: MessageSquare,
};

const categoryColors = {
  prompt: 'bg-green',
  usage: 'bg-sky',
  pattern: 'bg-sunshine',
};

const categoryLabels = {
  prompt: 'Prompt Tip',
  usage: 'Usage Tip',
  pattern: 'Your Pattern',
};

const categoryBadgeColors = {
  prompt: 'bg-green/10 text-green border-green/30',
  usage: 'bg-sky/10 text-sky border-sky/30',
  pattern: 'bg-sunshine/10 text-amber-700 border-sunshine/30',
};

export default function InsightTip({ title, description, category = 'prompt' }) {
  const Icon = categoryIcons[category] || Lightbulb;
  const color = categoryColors[category] || 'bg-green';
  const badgeLabel = categoryLabels[category] || 'Tip';
  const badgeColor = categoryBadgeColors[category] || 'bg-green/10 text-green border-green/30';

  return (
    <div className="p-4 bg-cream border-2 border-navy/10 flex items-start gap-3">
      <div className={`w-7 h-7 ${color} flex items-center justify-center flex-shrink-0 border-2 border-navy`}>
        <Icon size={14} className="text-navy" />
      </div>
      <div className="min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="font-black text-sm text-navy">{title}</p>
          <span className={`text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 border ${badgeColor}`}>
            {badgeLabel}
          </span>
        </div>
        <p className="text-xs text-slate font-bold mt-1 leading-relaxed">{description}</p>
      </div>
    </div>
  );
}
