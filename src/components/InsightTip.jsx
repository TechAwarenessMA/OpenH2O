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

export default function InsightTip({ title, description, category = 'prompt' }) {
  const Icon = categoryIcons[category] || Lightbulb;
  const color = categoryColors[category] || 'bg-green';

  return (
    <div className="p-4 bg-cream border-2 border-navy/10 flex items-start gap-3">
      <div className={`w-7 h-7 ${color} flex items-center justify-center flex-shrink-0`}>
        <Icon size={14} className="text-navy" />
      </div>
      <div>
        <p className="font-black text-sm text-navy">{title}</p>
        <p className="text-xs text-slate font-bold mt-1 leading-relaxed">{description}</p>
      </div>
    </div>
  );
}
