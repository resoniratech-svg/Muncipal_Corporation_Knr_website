import React from 'react';
import { Clock, Wrench, CheckCircle2, AlertTriangle, RotateCcw, CalendarDays, ClipboardCheck } from 'lucide-react';
import { usePrefs } from '../../i18n';

// Deck labels stay exact; the tooltip explains them in plain words
const HELP: Record<string, string> = {
  Pending: 'Waiting – not started yet',
  'In Progress': 'Work in progress',
  Completed: 'Work done – waiting for the councillor to check the photos',
  Resolved: 'Fixed and closed',
  Overdue: 'Delayed – past the SLA time',
  Reopened: 'Citizen said it is not solved; escalated one level',
  Planned: 'Planned work, not started',
};

const ICONS: Record<string, React.ElementType> = {
  Pending: Clock,
  'In Progress': Wrench,
  Completed: ClipboardCheck,
  Resolved: CheckCircle2,
  Overdue: AlertTriangle,
  Reopened: RotateCcw,
  Planned: CalendarDays,
};

export type ChipStatus = 'Pending' | 'In Progress' | 'Completed' | 'Resolved' | 'Overdue' | 'Reopened' | 'Planned' | 'Excellent' | 'Very Good' | 'Good' | 'Average' | 'Needs Improvement' | 'Poor';

interface StatusChipProps {
  status: ChipStatus | string;
  size?: 'sm' | 'md';
}

export const StatusChip: React.FC<StatusChipProps> = ({ status, size = 'md' }) => {
  const { t } = usePrefs();
  let style = 'bg-slate-100 text-slate-700 border-slate-200';

  switch (status) {
    case 'Pending':
      style = 'bg-amber-50 text-amber-800 border-amber-300 font-medium';
      break;
    case 'In Progress':
      style = 'bg-blue-50 text-blue-700 border-blue-300 font-medium';
      break;
    case 'Completed':
    case 'Resolved':
      style = 'bg-emerald-50 text-emerald-700 border-emerald-300 font-semibold';
      break;
    case 'Overdue':
    case 'Reopened':
      style = 'bg-red-50 text-red-700 border-red-300 font-semibold';
      break;
    case 'Planned':
      style = 'bg-slate-100 text-slate-600 border-slate-300';
      break;
    case 'Excellent':
    case 'A+':
      style = 'bg-emerald-100 text-emerald-800 border-emerald-300 font-bold';
      break;
    case 'Very Good':
    case 'A':
      style = 'bg-green-100 text-green-800 border-green-300 font-semibold';
      break;
    case 'Good':
    case 'B+':
      style = 'bg-sky-100 text-sky-800 border-sky-300 font-semibold';
      break;
    case 'Average':
    case 'B':
      style = 'bg-amber-100 text-amber-800 border-amber-300 font-semibold';
      break;
    case 'Needs Improvement':
    case 'C':
      style = 'bg-rose-100 text-rose-800 border-rose-300 font-semibold';
      break;
    case 'Poor':
    case 'D':
      style = 'bg-red-100 text-red-900 border-red-400 font-bold';
      break;
    default:
      style = 'bg-slate-100 text-slate-700 border-slate-200';
  }

  const Icon = ICONS[status];
  const padding = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs';

  return (
    <span title={HELP[status]} className={`inline-flex items-center justify-center gap-1 rounded-full border ${style} ${padding} transition-all`}>
      {Icon && <Icon className="w-3 h-3 shrink-0" aria-hidden="true" />}
      {t(status)}
    </span>
  );
};
