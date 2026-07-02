const colorMap = {
  sunshine: { bg: 'bg-sunshine', shadow: 'shadow-[4px_4px_0_0_#FAC206]', text: 'text-sunshine' },
  sky: { bg: 'bg-sky', shadow: 'shadow-[4px_4px_0_0_#16C0FF]', text: 'text-sky' },
  green: { bg: 'bg-green', shadow: 'shadow-[4px_4px_0_0_#2ECC71]', text: 'text-green' },
  coral: { bg: 'bg-coral', shadow: 'shadow-[4px_4px_0_0_#FB4B5F]', text: 'text-coral' },
};

export default function MetricCard({ icon: Icon, label, value, unit, color = 'green', comparison }) {
  const c = colorMap[color] || colorMap.green;

  return (
    <div className={`border-4 border-navy bg-white p-5 ${c.shadow} animate-fade-in-up`}>
      <div className="flex items-center gap-2 mb-3">
        <div className={`w-8 h-8 ${c.bg} flex items-center justify-center`}>
          <Icon size={18} className="text-navy" />
        </div>
        <span className="font-black text-xs uppercase tracking-wider text-slate">{label}</span>
      </div>
      <div className="mb-2">
        <span className="text-3xl font-black text-navy">{value}</span>
        <span className="text-sm font-bold text-slate ml-1">{unit}</span>
      </div>
      {comparison && (
        <p className={`text-xs font-bold ${c.text}`}>{comparison}</p>
      )}
    </div>
  );
}
