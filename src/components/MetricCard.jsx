const colorMap = {
  sunshine: {
    bg: 'bg-sunshine/15',
    iconBg: 'bg-sunshine',
    border: 'border-sunshine/30',
    text: 'text-sunshine',
    valueDot: '#F5B700',
  },
  sky: {
    bg: 'bg-sky/10',
    iconBg: 'bg-sky',
    border: 'border-sky/30',
    text: 'text-sky',
    valueDot: '#00BEFF',
  },
  green: {
    bg: 'bg-green/10',
    iconBg: 'bg-green',
    border: 'border-green/30',
    text: 'text-green',
    valueDot: '#16c964',
  },
  coral: {
    bg: 'bg-coral/10',
    iconBg: 'bg-coral',
    border: 'border-coral/30',
    text: 'text-coral',
    valueDot: '#FF4058',
  },
};

export default function MetricCard({ icon: Icon, label, value, unit, color = 'green', comparison }) {
  const c = colorMap[color] || colorMap.green;

  return (
    <div className={`relative overflow-hidden rounded-2xl bg-white border ${c.border} p-5 shadow-sm animate-fade-in-up transition-transform duration-200 hover:-translate-y-0.5`}>
      {/* Subtle colored top strip */}
      <div className={`absolute top-0 left-0 right-0 h-1 ${c.iconBg} opacity-70 rounded-t-2xl`} />

      <div className="flex items-center gap-2.5 mb-4 mt-1">
        <div className={`w-9 h-9 ${c.iconBg} rounded-xl flex items-center justify-center shadow-sm`}>
          <Icon size={17} className="text-white" />
        </div>
        <span className="font-bold text-xs uppercase tracking-widest text-slate">{label}</span>
      </div>

      <div className="mb-2.5">
        <span
          className="font-data text-3xl font-bold text-navy tracking-tight leading-none"
          style={{ fontFamily: "'Space Mono', monospace" }}
        >
          {value}
        </span>
        <span className="text-sm font-medium text-slate ml-1.5">{unit}</span>
      </div>

      {comparison && (
        <p className={`text-xs font-semibold ${c.text} leading-snug`}>{comparison}</p>
      )}
    </div>
  );
}
