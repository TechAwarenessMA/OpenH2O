import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { formatMonth } from '../utils/formatters';

const METRICS = [
  { key: 'tokens', label: 'Tokens', color: '#2ECC71', unit: '' },
  { key: 'energyKwh', label: 'Energy', color: '#2ECC71', unit: 'kWh' },
  { key: 'waterLiters', label: 'Water', color: '#16C0FF', unit: 'L' },
  { key: 'carbonGrams', label: 'Carbon', color: '#FB4B5F', unit: 'g' },
];

export default function UsageChart({ data }) {
  const [activeMetric, setActiveMetric] = useState('tokens');
  const metric = METRICS.find(m => m.key === activeMetric);

  const chartData = data.map(d => ({
    ...d,
    label: formatMonth(d.month),
  }));

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-4" onClick={e => e.stopPropagation()}>
        {METRICS.map(m => (
          <button
            key={m.key}
            onClick={(e) => { e.stopPropagation(); setActiveMetric(m.key); }}
            className={`px-3 py-1.5 text-xs font-black uppercase tracking-wider border-2 transition-colors ${
              activeMetric === m.key
                ? 'border-navy bg-navy text-white'
                : 'border-navy/20 bg-white text-slate hover:border-navy/40'
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11, fontWeight: 700, fill: '#8B9B9C' }}
            axisLine={{ stroke: '#2C3E50', strokeWidth: 2 }}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fontWeight: 700, fill: '#8B9B9C' }}
            axisLine={{ stroke: '#2C3E50', strokeWidth: 2 }}
            tickLine={false}
            width={55}
          />
          <Tooltip
            contentStyle={{
              border: '3px solid #2C3E50',
              borderRadius: 0,
              fontWeight: 700,
              fontSize: 12,
            }}
            formatter={(value) => {
              const formatted = typeof value === 'number' ? value.toLocaleString(undefined, { maximumFractionDigits: 4 }) : value;
              return [formatted, `${metric.label}${metric.unit ? ` (${metric.unit})` : ''}`];
            }}
          />
          <Bar dataKey={activeMetric} fill={metric.color} radius={[2, 2, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
