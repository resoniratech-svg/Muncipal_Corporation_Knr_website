import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface DataPoint {
  name: string;
  value: number;
  color?: string;
  [key: string]: any;
}

interface DonutChartProps {
  data: DataPoint[];
  centerLabel?: string;
  centerSublabel?: string;
  height?: number;
  innerRadius?: number;
  outerRadius?: number;
  showLegend?: boolean;
  /** Appended to values in the legend and tooltip; pass '' when the data are counts. */
  valueSuffix?: string;
}

const DEFAULT_COLORS = ['#2E7D32', '#0288D1', '#F57C00', '#FBC02D', '#7B1FA2', '#D32F2F', '#00897B'];

export const DonutChart: React.FC<DonutChartProps> = ({
  data,
  centerLabel,
  centerSublabel,
  height = 220,
  innerRadius = 55,
  outerRadius = 80,
  showLegend = true,
  valueSuffix = '%',
}) => {
  return (
    <div className="flex flex-col items-center justify-center relative w-full">
      <div style={{ width: '100%', height }} className="relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip
              formatter={(val: number) => [`${val}${valueSuffix}`, valueSuffix === '%' ? 'Share' : 'Count']}
              contentStyle={{ backgroundColor: '#0B2A5B', color: '#fff', borderRadius: '8px', border: 'none', fontSize: '12px' }}
              itemStyle={{ color: '#F1D26E' }}
            />
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={innerRadius}
              outerRadius={outerRadius}
              paddingAngle={3}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        {centerLabel && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-xl sm:text-2xl font-black font-heading text-slate-800 leading-tight">
              {centerLabel}
            </span>
            {centerSublabel && (
              <span className="text-[11px] sm:text-xs text-slate-500 font-semibold uppercase">
                {centerSublabel}
              </span>
            )}
          </div>
        )}
      </div>

      {showLegend && (
        <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 mt-2 text-xs">
          {data.map((entry, index) => (
            <div key={index} className="flex items-center gap-1.5">
              <span
                className="w-2.5 h-2.5 rounded-full inline-block shrink-0"
                style={{ backgroundColor: entry.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length] }}
              />
              <span className="text-slate-600 font-medium">
                {entry.name}: <strong className="text-slate-800">{entry.value}{valueSuffix}</strong>
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
