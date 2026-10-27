import React from 'react';
import { usePrefs } from '../../i18n';

interface KpiCardProps {
  label: string;
  value: string | number;
  delta?: string;
  deltaType?: 'positive' | 'negative' | 'neutral';
  sublabel?: string;
  icon?: React.ReactNode;
  highlightColor?: string;
  className?: string;
}

export const KpiCard: React.FC<KpiCardProps> = ({
  label,
  value,
  delta,
  deltaType = 'positive',
  sublabel,
  icon,
  highlightColor = 'border-l-kmc-navy',
  className = '',
}) => {
  const { t } = usePrefs();

  const getDeltaBadge = () => {
    if (!delta) return null;
    let deltaClass = 'bg-slate-100 text-slate-700';
    if (delta.includes('▲') || delta.includes('↑')) {
      deltaClass = deltaType === 'positive' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800';
    } else if (delta.includes('▼') || delta.includes('↓')) {
      deltaClass = deltaType === 'positive' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800';
    }

    return (
      <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded ${deltaClass} ml-2 inline-flex items-center`}>
        {t(delta)}
      </span>
    );
  };

  return (
    <div className={`bg-white rounded-xl shadow-card border border-slate-100 p-4 sm:p-5 relative overflow-hidden border-l-4 ${highlightColor} ${className}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs uppercase tracking-wider font-semibold text-slate-500 font-heading">
            {t(label)}
          </p>
          <div className="mt-1 flex items-baseline">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading tracking-tight">
              {value}
            </span>
            {getDeltaBadge()}
          </div>
          {sublabel && (
            <p className="mt-1 text-xs text-slate-500 font-medium">
              {t(sublabel)}
            </p>
          )}
        </div>
        {icon && (
          <div className="p-2.5 rounded-lg bg-slate-50 text-slate-700 shrink-0">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
};
