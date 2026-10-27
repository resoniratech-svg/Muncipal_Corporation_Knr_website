import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Ward } from '../../data/wards';

interface WardMapSvgProps {
  onWardSelect?: (wardId: number) => void;
  selectedWardId?: number;
  /** Narrow column next to the ward overview: smaller grid, no info bar */
  compact?: boolean;
}

export const WardMapSvg: React.FC<WardMapSvgProps> = ({ onWardSelect, selectedWardId, compact = false }) => {
  const { wards, activeWardId, setActiveWardId } = useApp();
  const [hoveredWard, setHoveredWard] = useState<Ward | null>(null);

  const currentSelected = selectedWardId !== undefined ? selectedWardId : activeWardId;

  const handleSelect = (id: number) => {
    setActiveWardId(id);
    if (onWardSelect) onWardSelect(id);
  };

  const getWardColor = (score: number) => {
    if (score >= 80) return '#2E7D32'; // Excellent (80-100%)
    if (score >= 60) return '#0288D1'; // Good (60-79%)
    if (score >= 40) return '#F57C00'; // Average (40-59%)
    return '#D32F2F';                 // Poor (0-39%)
  };

  // 66 ward grid layout (arranged in an organic 11 x 6 grid representing municipal layout)
  const cols = 11;

  return (
    <div className="bg-white rounded-xl shadow-card border border-slate-200 p-4 relative">
      <div className={`flex flex-col ${compact ? '' : 'sm:flex-row sm:items-center'} justify-between pb-3 mb-3 border-b border-slate-100 gap-2`}>
        <div>
          <h4 className="text-sm font-bold font-heading uppercase text-slate-800">
            Karimnagar City Ward Heat-Map (66 Wards)
          </h4>
          <p className="text-xs text-slate-500">
            Click any ward to drill-down into ward metrics & active grievances
          </p>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-2 text-[11px]">
          <span className="flex items-center gap-1 font-medium text-slate-700">
            <span className="w-2.5 h-2.5 rounded bg-[#2E7D32]"></span>
            Excellent (80-100%)
          </span>
          <span className="flex items-center gap-1 font-medium text-slate-700">
            <span className="w-2.5 h-2.5 rounded bg-[#0288D1]"></span>
            Good (60-79%)
          </span>
          <span className="flex items-center gap-1 font-medium text-slate-700">
            <span className="w-2.5 h-2.5 rounded bg-[#F57C00]"></span>
            Average (40-59%)
          </span>
          <span className="flex items-center gap-1 font-medium text-slate-700">
            <span className="w-2.5 h-2.5 rounded bg-[#D32F2F]"></span>
            Poor (0-39%)
          </span>
        </div>
      </div>

      {compact ? (
        <div className="grid grid-cols-5 sm:grid-cols-8 lg:grid-cols-5 xl:grid-cols-6 gap-1.5" role="group" aria-label="Wards">
          {wards.map((ward) => {
            const isSelected = ward.id === currentSelected;
            return (
              <button
                key={ward.id}
                type="button"
                onClick={() => handleSelect(ward.id)}
                aria-pressed={isSelected}
                aria-label={`Ward ${ward.id}, score ${ward.score}%`}
                className={`aspect-square rounded-md text-white flex flex-col items-center justify-center leading-tight transition-transform hover:scale-105 ${isSelected ? 'ring-[3px] ring-amber-500 ring-offset-1' : 'opacity-90'}`}
                style={{ backgroundColor: getWardColor(ward.score) }}
              >
                <span className="text-[11px] font-bold">W{ward.id}</span>
                <span className="text-[11px] opacity-90">{ward.score}%</span>
              </button>
            );
          })}
        </div>
      ) : (
      <>
      {/* SVG Map Grid */}
      <div className="overflow-x-auto">
        <svg viewBox="0 0 660 380" className="w-full h-auto min-w-[500px]">
          {/* Subtle Boundary Outline */}
          <rect x="5" y="5" width="650" height="370" rx="16" fill="#F8FAFC" stroke="#E2E8F0" strokeWidth="2" strokeDasharray="4 4" />
          
          {wards.map((ward, idx) => {
            const col = idx % cols;
            const row = Math.floor(idx / cols);
            const x = 20 + col * 56;
            const y = 20 + row * 58;
            const isSelected = ward.id === currentSelected;
            const color = getWardColor(ward.score);

            return (
              <g
                key={ward.id}
                onClick={() => handleSelect(ward.id)}
                onMouseEnter={() => setHoveredWard(ward)}
                onMouseLeave={() => setHoveredWard(null)}
                className="cursor-pointer transition-transform duration-150 hover:scale-105"
                style={{ transformOrigin: `${x + 24}px ${y + 24}px` }}
              >
                {/* Ward Cell */}
                <rect
                  x={x}
                  y={y}
                  width="48"
                  height="48"
                  rx="6"
                  fill={color}
                  stroke={isSelected ? '#F59E0B' : '#FFFFFF'}
                  strokeWidth={isSelected ? '3' : '1.5'}
                  className="transition-all"
                  opacity={isSelected ? 1 : 0.88}
                />
                {/* Ward Number */}
                <text
                  x={x + 24}
                  y={y + 22}
                  textAnchor="middle"
                  fill="#FFFFFF"
                  fontSize="12"
                  fontWeight="bold"
                  fontFamily="sans-serif"
                >
                  W{ward.id}
                </text>
                {/* Score */}
                <text
                  x={x + 24}
                  y={y + 36}
                  textAnchor="middle"
                  fill="#FFFFFF"
                  fontSize="9.5"
                  opacity="0.9"
                  fontFamily="sans-serif"
                >
                  {ward.score}%
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Tooltip / Active Ward Info Bar */}
      <div className="mt-3 p-2.5 bg-slate-50 border border-slate-200 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs gap-2">
        <div className="flex items-center gap-3">
          <span className="font-bold text-kmc-navy font-heading text-sm">
            Selected: Ward {currentSelected} – {wards.find(w => w.id === currentSelected)?.name}
          </span>
          <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-800 font-semibold text-[11px]">
            Score: {wards.find(w => w.id === currentSelected)?.score}/100 ({wards.find(w => w.id === currentSelected)?.level})
          </span>
        </div>
        <div className="flex items-center gap-4 text-slate-600">
          <span>Complaints: <strong>{wards.find(w => w.id === currentSelected)?.totalComplaints}</strong></span>
          <span>Pending: <strong className="text-amber-700">{wards.find(w => w.id === currentSelected)?.pendingComplaints}</strong></span>
          <span>Resolved: <strong className="text-emerald-700">{wards.find(w => w.id === currentSelected)?.completedComplaints}</strong></span>
        </div>
      </div>
      </>
      )}
    </div>
  );
};
