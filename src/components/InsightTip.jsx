import { Lightbulb, TrendingUp, MessageSquare } from 'lucide-react';

const categoryConfig = {
  prompt:  { icon: Lightbulb,      bg: 'rgba(22,201,100,0.12)',  color: '#16c964' },
  usage:   { icon: TrendingUp,     bg: 'rgba(0,190,255,0.12)',   color: '#00BEFF' },
  pattern: { icon: MessageSquare,  bg: 'rgba(245,183,0,0.12)',   color: '#F5B700' },
};

const difficultyClass = {
  easy:   'difficulty-easy',
  medium: 'difficulty-medium',
  hard:   'difficulty-hard',
};

export default function InsightTip({ title, description, category = 'prompt', difficulty = 'easy' }) {
  const config = categoryConfig[category] || categoryConfig.prompt;
  const Icon = config.icon;

  return (
    <div className="tip-card">
      <div className="tip-icon-wrap" style={{ background: config.bg }}>
        <Icon size={14} style={{ color: config.color }} />
      </div>
      <div className="tip-content">
        <div className="tip-title-row">
          <p className="tip-title">{title}</p>
          <span className={difficultyClass[difficulty] || 'difficulty-easy'}>{difficulty}</span>
        </div>
        <p className="tip-desc">{description}</p>
      </div>
    </div>
  );
}
