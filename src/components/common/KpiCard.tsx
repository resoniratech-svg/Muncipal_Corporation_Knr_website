import React from 'react';
import { usePrefs } from '../../i18n';
import { ChevronRight } from 'lucide-react';

interface KpiCardProps {
  label: string;
  value: string | number;
  delta?: string;
  deltaType?: 'positive' | 'negative' | 'neutral';
  sublabel?: string;
  icon?: React.ReactNode;
  highlightColor?: string;
  className?: string;
  onClick?: () => void;
  isActive?: boolean;
  actionHint?: string;
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
  onClick,
  isActive = false,
  actionHint,
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

  const isClickable = Boolean(onClick);

  return (
    <div
      onClick={onClick}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onKeyDown={isClickable ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.();
        }
      } : undefined}
      className={`bg-white rounded-xl shadow-card border border-slate-100 p-4 sm:p-5 relative overflow-hidden border-l-4 ${highlightColor} ${
        isClickable ? 'cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-lg active:scale-[0.98] group select-none' : ''
      } ${isActive ? 'ring-2 ring-kmc-navy shadow-md bg-slate-50/70 scale-[1.02]' : ''} ${className}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-1.5">
            <p className="text-xs uppercase tracking-wider font-semibold text-slate-500 font-heading">
              {t(label)}
            </p>
            {isActive && (
              <span className="w-2 h-2 rounded-full bg-kmc-navy animate-pulse" />
            )}
          </div>
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
          <div className="p-2.5 rounded-lg bg-slate-50 text-slate-700 shrink-0 group-hover:scale-110 transition-transform">
            {icon}
          </div>
        )}
      </div>

      {isClickable && (
        <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-semibold text-slate-400 group-hover:text-kmc-navy transition-colors">
          <span>{actionHint ? t(actionHint) : t('Click to view')}</span>
          <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
        </div>
      )}
    </div>
  );
};
