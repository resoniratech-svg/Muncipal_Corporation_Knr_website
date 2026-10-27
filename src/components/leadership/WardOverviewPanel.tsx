import React from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Phone, UserCircle2, HardHat, Users, Smartphone, ClipboardList, CheckCircle2, Clock, Wrench, AlertTriangle, ArrowRight, Building2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { buildWardDirectory, StaffMember } from '../../data/wardDirectory';
import { GrievanceItem } from '../../data/grievances';
import { StatusChip } from '../common/StatusChip';
import { usePrefs } from '../../i18n';

interface WardOverviewPanelProps {
  wardId: number;
  onClose: () => void;
  onOpenComplaint: (g: GrievanceItem) => void;
}

const levelColor = (score: number) => (score >= 80 ? 'bg-[#2E7D32]' : score >= 60 ? 'bg-[#0288D1]' : score >= 40 ? 'bg-[#F57C00]' : 'bg-[#D32F2F]');

const CallLink: React.FC<{ mobile: string }> = ({ mobile }) => (
  <a href={`tel:${mobile.replace(/\s/g, '')}`} className="inline-flex items-center gap-1 font-mono text-xs text-kmc-navy hover:underline whitespace-nowrap">
    <Phone className="w-3.5 h-3.5" aria-hidden="true" />
    {mobile}
  </a>
);

const StaffTable: React.FC<{ staff: StaffMember[]; showTasks?: boolean }> = ({ staff, showTasks }) => {
  const { t } = usePrefs();
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="text-left text-[11px] uppercase text-slate-500 border-b border-slate-200">
            <th className="py-1.5 pr-2 font-semibold">{t('Name')}</th>
            <th className="py-1.5 pr-2 font-semibold">{t('Role')}</th>
            <th className="py-1.5 pr-2 font-semibold hidden sm:table-cell">{t('Department')}</th>
            {showTasks && <th className="py-1.5 pr-2 font-semibold text-center">{t('Open tasks')}</th>}
            <th className="py-1.5 font-semibold">{t('Mobile')}</th>
          </tr>
        </thead>
        <tbody>
          {staff.map((s) => (
            <tr key={s.name + s.role} className="border-b border-slate-100 last:border-0">
              <td className="py-2 pr-2 font-semibold text-slate-900">{s.name}</td>
              <td className="py-2 pr-2 text-slate-700">{t(s.role)}</td>
              <td className="py-2 pr-2 text-slate-600 hidden sm:table-cell">{t(s.department)}</td>
              {showTasks && <td className="py-2 pr-2 text-center font-bold">{s.openTasks ?? 0}</td>}
              <td className="py-2"><CallLink mobile={s.mobile} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const Card: React.FC<{ title: string; icon: React.ElementType; extra?: React.ReactNode; children: React.ReactNode }> = ({ title, icon: Icon, extra, children }) => (
  <div className="rounded-xl border border-slate-200 bg-white p-4">
    <div className="flex items-center justify-between gap-2 mb-3">
      <h5 className="text-xs font-bold font-heading uppercase text-slate-800 flex items-center gap-1.5">
        <Icon className="w-4 h-4 text-kmc-navy" aria-hidden="true" />
        {title}
      </h5>
      {extra}
    </div>
    {children}
  </div>
);

export const WardOverviewPanel: React.FC<WardOverviewPanelProps> = ({ wardId, onClose, onOpenComplaint }) => {
  const navigate = useNavigate();
  const { wards, grievances, tasks, setActiveWardId } = useApp();
  const { t } = usePrefs();
  const ward = wards.find((w) => w.id === wardId);
  if (!ward) return null;

  const dir = buildWardDirectory(ward, grievances, tasks);
  const wardComplaints = grievances.filter((g) => g.wardId === ward.id);
  const liveSolved = wardComplaints.filter((g) => g.status === 'Resolved').length;
  const liveOpen = wardComplaints.length - liveSolved;
  const solvedPct = Math.round((ward.completedComplaints / Math.max(1, ward.totalComplaints)) * 100);

  const stats = [
    { label: t('Total issues'), value: ward.totalComplaints, icon: ClipboardList, tone: 'text-slate-900' },
    { label: t('Solved'), value: ward.completedComplaints, icon: CheckCircle2, tone: 'text-emerald-700' },
    { label: t('Pending'), value: ward.pendingComplaints, icon: Clock, tone: 'text-amber-700' },
    { label: t('In progress'), value: ward.inProgressComplaints, icon: Wrench, tone: 'text-blue-700' },
    { label: t('Overdue'), value: ward.overdueComplaints, icon: AlertTriangle, tone: 'text-rose-700' },
  ];

  return (
    <div className="rounded-xl border-2 border-kmc-navy/20 bg-slate-50 p-4 space-y-4" aria-live="polite">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <span className={`${levelColor(ward.score)} text-white rounded-lg w-14 h-14 shrink-0 flex flex-col items-center justify-center font-bold`}>
            <span className="text-base leading-none">W{ward.id}</span>
            <span className="text-[11px] opacity-90">{ward.score}%</span>
          </span>
          <div className="min-w-0">
            <h4 className="text-lg font-bold font-heading text-slate-900 uppercase truncate">
              {ward.name.startsWith('Ward ') ? t(ward.name) : `${t('Ward')} ${ward.id} – ${t(ward.name)}`}
            </h4>
            <p className="text-xs text-slate-600 mt-0.5">
              {t('Score')} {ward.score}/100 · {t('Grade')} {ward.grade} · {t(ward.level)} · {t('Trend')} {ward.trend} · {t('Population')} {ward.population.toLocaleString('en-IN')}
            </p>
          </div>
        </div>
        <button type="button" onClick={onClose} aria-label={t('Close ward overview')} className="w-10 h-10 shrink-0 rounded-lg border border-slate-300 bg-white flex items-center justify-center hover:bg-slate-100">
          <X className="w-5 h-5" aria-hidden="true" />
        </button>
      </div>

      {/* Issue counts */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {stats.map((s) => (
          <div key={s.label} className="rounded-lg bg-white border border-slate-200 p-3">
            <p className="text-[11px] uppercase font-semibold text-slate-500 flex items-center gap-1">
              <s.icon className="w-3.5 h-3.5" aria-hidden="true" />
              {s.label}
            </p>
            <p className={`text-xl font-extrabold font-heading ${s.tone}`}>{s.value}</p>
          </div>
        ))}
      </div>
      <div>
        <div className="flex justify-between text-xs text-slate-600 mb-1">
          <span>{t('Issues solved')}</span>
          <span className="font-bold">{solvedPct}%</span>
        </div>
        <div className="h-2 rounded-full bg-slate-200 overflow-hidden">
          <div className="h-full bg-emerald-600" style={{ width: `${solvedPct}%` }} />
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Corporator */}
        <Card title={t('Corporator')} icon={UserCircle2}>
          <p className="text-base font-bold text-slate-900">{dir.corporator.name}</p>
          <p className="text-xs text-slate-600">{t('Elected Corporator')} – {t('Ward')} {ward.id}</p>
          <div className="mt-2"><CallLink mobile={dir.corporator.mobile} /></div>
          <p className="mt-3 text-xs text-slate-600">
            {t('Ward budget:')} <strong className="text-slate-900">₹{ward.budgetAllocatedCr} Cr</strong> {t('allocated')}, <strong className="text-slate-900">₹{ward.budgetUtilizedCr} Cr</strong> {t('used')}
          </p>
        </Card>

        {/* Citizens using the app */}
        <Card title={t('Citizens using the app')} icon={Smartphone}>
          <div className="flex gap-6">
            <div>
              <p className="text-2xl font-extrabold font-heading text-slate-900">{dir.citizensRegistered.toLocaleString('en-IN')}</p>
              <p className="text-[11px] uppercase text-slate-500 font-semibold">{t('Registered')}</p>
            </div>
            <div>
              <p className="text-2xl font-extrabold font-heading text-emerald-700">{dir.citizensActive.toLocaleString('en-IN')}</p>
              <p className="text-[11px] uppercase text-slate-500 font-semibold">{t('Active this month')}</p>
            </div>
          </div>
          <ul className="mt-3 divide-y divide-slate-100 text-xs max-h-48 overflow-y-auto">
            {dir.recentCitizens.map((c) => (
              <li key={c.name + c.joined} className="py-1.5 flex items-center justify-between gap-2">
                <span className="min-w-0">
                  <span className="block font-semibold text-slate-800 truncate">{c.name}</span>
                  <span className="block text-slate-500">{c.complaints} {c.complaints === 1 ? t('issue') : t('issues')} · {t('joined')} {c.joined}</span>
                </span>
                <span className="font-mono text-slate-500 whitespace-nowrap">{c.mobile}</span>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-[11px] text-slate-500">{t('Citizen numbers are masked for privacy.')}</p>
        </Card>
      </div>

      {/* Field staff */}
      <Card title={`${t('Field staff')} (${dir.fieldStaff.length})`} icon={HardHat}>
        <StaffTable staff={dir.fieldStaff} showTasks />
      </Card>

      {/* Other ward staff */}
      <Card title={`${t('Other staff in this ward')} (${dir.otherStaff.length})`} icon={Users}>
        <StaffTable staff={dir.otherStaff} />
      </Card>

      {/* Live complaints in this ward */}
      <Card
        title={t('Complaints in the app for this ward')}
        icon={Building2}
        extra={<span className="text-xs text-slate-600">{liveOpen} {t('open')} · {liveSolved} {t('solved')}</span>}
      >
        {wardComplaints.length === 0 ? (
          <p className="text-sm text-slate-600">{t('No complaints have been filed through the app for this ward yet.')}</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {wardComplaints.map((g) => (
              <li key={g.id}>
                <button type="button" onClick={() => onOpenComplaint(g)} className="w-full text-left py-2 flex items-center gap-3 hover:bg-slate-50 rounded">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate">{t(g.description)}</p>
                    <p className="text-xs text-slate-500 truncate">{g.id} · {t(g.category)} · {t(g.location)} · {g.assignedTo ? t(g.assignedTo) : t('Not assigned yet')}</p>
                  </div>
                  <StatusChip status={g.status} size="sm" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-[11px] text-slate-500">{t('Staff names and mobile numbers are demo data.')}</p>
        <button
          type="button"
          onClick={() => {
            setActiveWardId(ward.id);
            navigate('/ward');
          }}
          className="min-h-[40px] px-3 bg-kmc-navy hover:bg-kmc-navy-light text-white text-xs font-bold rounded-lg flex items-center gap-1"
        >
          {t('Open Ward Console')} <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
};
