import React from 'react';
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';

interface BarDataPoint {
  name: string;
  value: number;
  secondaryValue?: number;
  color?: string;
  [key: string]: any;
}

interface BarChartProps {
  data: BarDataPoint[];
  dataKey?: string;
  secondaryDataKey?: string;
  height?: number;
  horizontal?: boolean;
  color?: string;
  unit?: string;
}

export const BarChart: React.FC<BarChartProps> = ({
  data,
  dataKey = "value",
  secondaryDataKey,
  height = 240,
  horizontal = false,
  color = "#0B2A5B",
  unit = "",
}) => {
  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsBarChart
          data={data}
          layout={horizontal ? "vertical" : "horizontal"}
          margin={{ top: 10, right: 15, left: horizontal ? 40 : -15, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
          {horizontal ? (
            <>
              <XAxis type="number" tick={{ fontSize: 11, fill: '#64748B' }} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: '#1E293B', fontWeight: 500 }} width={80} />
            </>
          ) : (
            <>
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748B' }} />
              <YAxis tick={{ fontSize: 11, fill: '#64748B' }} />
            </>
          )}
          <Tooltip
            formatter={(val: number) => [`${val}${unit}`, 'Value']}
            contentStyle={{ backgroundColor: '#0B2A5B', color: '#fff', borderRadius: '8px', border: 'none', fontSize: '12px' }}
          />
          <Bar dataKey={dataKey} fill={color} radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color || color} />
            ))}
          </Bar>
          {secondaryDataKey && (
            <Bar dataKey={secondaryDataKey} fill="#7CB342" radius={[4, 4, 0, 0]} />
          )}
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
};
