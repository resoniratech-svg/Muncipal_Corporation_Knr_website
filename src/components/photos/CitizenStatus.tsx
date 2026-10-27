import React from 'react';
import { Clock, Wrench, ClipboardCheck, CheckCircle2, AlertTriangle, RotateCcw } from 'lucide-react';
import { GrievanceStatus } from '../../data/grievances';
import { usePrefs } from '../../i18n';

/** Status is always colour + icon + word (never colour alone). */
export const STATUS_META: Record<GrievanceStatus, { key: string; icon: React.ElementType; className: string }> = {
  Pending: { key: 'status.waiting', icon: Clock, className: 'bg-amber-50 text-amber-900 border-amber-400' },
  'In Progress': { key: 'status.inProgress', icon: Wrench, className: 'bg-blue-50 text-blue-900 border-blue-400' },
  Completed: { key: 'status.checking', icon: ClipboardCheck, className: 'bg-sky-50 text-sky-900 border-sky-400' },
  Resolved: { key: 'status.fixed', icon: CheckCircle2, className: 'bg-emerald-50 text-emerald-900 border-emerald-500' },
  Overdue: { key: 'status.delayed', icon: AlertTriangle, className: 'bg-red-50 text-red-900 border-red-500' },
  Reopened: { key: 'status.reopened', icon: RotateCcw, className: 'bg-red-50 text-red-900 border-red-500' },
};

export const CitizenStatus: React.FC<{ status: GrievanceStatus; english?: boolean; size?: 'md' | 'lg' }> = ({ status, english, size = 'md' }) => {
  const { t, tEn, lang } = usePrefs();
  const meta = STATUS_META[status] || STATUS_META.Pending;
  const Icon = meta.icon;
  const translator = (english && lang === 'en') ? tEn : t;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border-2 font-semibold ${meta.className} ${size === 'lg' ? 'px-3 py-1.5 text-base' : 'px-2.5 py-1 text-sm'}`}>
      <Icon className={size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'} aria-hidden="true" />
      {translator(meta.key)}
    </span>
  );
};
