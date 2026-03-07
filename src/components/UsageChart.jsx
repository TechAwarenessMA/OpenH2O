import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { formatMonth } from '../utils/formatters';

export default function UsageChart({ data }) {
  const chartData = data.map(d => ({
    ...d,
    label: formatMonth(d.month),
  }));

  return (
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
          width={50}
        />
        <Tooltip
          contentStyle={{
            border: '3px solid #2C3E50',
            borderRadius: 0,
            fontWeight: 700,
            fontSize: 12,
          }}
          formatter={(value, name) => {
            const labels = { tokens: 'Tokens', energyKwh: 'Energy (kWh)', waterLiters: 'Water (L)', carbonGrams: 'Carbon (g)' };
            return [typeof value === 'number' ? value.toLocaleString() : value, labels[name] || name];
          }}
        />
        <Bar dataKey="tokens" fill="#2ECC71" radius={[2, 2, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
