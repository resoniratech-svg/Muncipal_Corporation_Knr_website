import React from 'react';
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';

interface LineChartProps {
  data: any[];
  lines: { key: string; name: string; color: string; unit?: string }[];
  height?: number;
}

export const LineChart: React.FC<LineChartProps> = ({
  data,
  lines,
  height = 250,
}) => {
  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsLineChart data={data} margin={{ top: 10, right: 15, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
          <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748B' }} />
          <YAxis tick={{ fontSize: 11, fill: '#64748B' }} />
          <Tooltip
            contentStyle={{ backgroundColor: '#0B2A5B', color: '#fff', borderRadius: '8px', border: 'none', fontSize: '12px' }}
          />
          <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} formatter={(value) => <span style={{ color: '#334155' }}>{value}</span>} />
          {lines.map((l) => (
            <Line
              key={l.key}
              type="monotone"
              dataKey={l.key}
              name={l.name}
              stroke={l.color}
              strokeWidth={2.5}
              dot={{ r: 3, fill: l.color }}
              activeDot={{ r: 6 }}
            />
          ))}
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  );
};
