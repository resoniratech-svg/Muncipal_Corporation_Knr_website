import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Megaphone, Banknote, MapPin, ChevronRight, X, SlidersHorizontal } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../auth/AuthContext';
import { usePrefs } from '../../i18n';
import { getAfterPhotos, getBeforePhotos, GrievanceItem } from '../../data/grievances';
import { categoryFor } from '../../data/categories';
import { resolvePhoto } from '../../photos/photoStore';
import { BeforeAfterViewer } from '../../components/photos/BeforeAfterViewer';
import { CitizenLayout } from './CitizenLayout';
import { EmptyState } from './TrackComplaints';
import { SearchableSelect } from '../../components/common/SearchableSelect';
import { FullImagePreview } from '../../components/common/FullImagePreview';

/** Ward Information: councillor, work status and the ward's development projects. */
export const WardInfo: React.FC = () => {
  const navigate = useNavigate();
  const { t } = usePrefs();
  const { wards, projects } = useApp();
  const { currentUser } = useAuth();
  const wardId = currentUser?.assignedWardIds?.[0] || 27;
  const ward = wards.find((w) => w.id === wardId);
  const wardProjects = projects.filter((p) => p.wardId === wardId);
  // Ward Development Overview printed on deck Page 7 (Ward 27)
  const summary = [
    { label: t('wardInfo.done'), value: 65, color: 'bg-emerald-600' },
    { label: t('wardInfo.ongoing'), value: 25, color: 'bg-blue-600' },
    { label: t('wardInfo.planned'), value: 10, color: 'bg-slate-400' },
  ];

  return (
    <CitizenLayout title={t('wardInfo.title')}>
      <section className="bg-white rounded-2xl border-2 border-slate-200 p-5">
        <h2 className="text-2xl font-bold font-body tracking-normal">Ward {wardId} – {ward?.name}</h2>
        <p className="mt-1 text-base text-slate-700">{t('wardInfo.councillor')}: <strong>{ward?.corporator}</strong></p>
      </section>

      {wardId === 27 && (
        <section className="mt-5 bg-white rounded-2xl border-2 border-slate-200 p-5">
          <h3 className="text-xl font-bold font-body tracking-normal">{t('wardInfo.summary')}</h3>
          <div className="mt-3 h-6 rounded-full overflow-hidden flex" aria-hidden="true">
            {summary.map((s) => (
              <span key={s.label} className={s.color} style={{ width: `${s.value}%` }} />
            ))}
          </div>
          <ul className="mt-3 grid grid-cols-3 gap-2 text-base">
            {summary.map((s) => (
              <li key={s.label} className="flex items-center gap-2">
                <span className={`w-3 h-3 rounded-full ${s.color}`} aria-hidden="true" />
                {s.label}: <strong>{s.value}%</strong>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="mt-5">
        <h3 className="text-xl font-bold font-body tracking-normal mb-3">{t('wardInfo.works')}</h3>
        {wardProjects.length === 0 ? (
          <EmptyState title={t('wardInfo.noWorks')} />
        ) : (
          <ul className="space-y-3">
            {wardProjects.map((p) => (
              <li key={p.id} className="bg-white rounded-2xl border-2 border-slate-200 p-4">
                <p className="text-lg font-bold">{p.name}</p>
                <div className="mt-2 h-3 rounded-full bg-slate-200 overflow-hidden" role="progressbar" aria-valuenow={p.progress} aria-valuemin={0} aria-valuemax={100} aria-label={p.name}>
                  <div className={`h-full ${p.progress === 100 ? 'bg-emerald-600' : 'bg-blue-600'}`} style={{ width: `${p.progress}%` }} />
                </div>
                <dl className="mt-2 grid grid-cols-3 gap-2 text-base">
                  <div><dt className="text-sm text-slate-600">{t('wardInfo.progress')}</dt><dd className="font-bold">{p.progress}%</dd></div>
                  <div><dt className="text-sm text-slate-600">{t('wardInfo.budget')}</dt><dd className="font-bold">₹{p.budgetLakhs.toFixed(2)} L</dd></div>
                  <div><dt className="text-sm text-slate-600">{t('wardInfo.finish')}</dt><dd className="font-bold">{p.completionDate}</dd></div>
                </dl>
              </li>
            ))}
          </ul>
        )}
      </section>

      <button
        type="button"
        onClick={() => navigate('/citizen/portal')}
        className="mt-5 w-full min-h-[52px] rounded-xl border-2 border-kmc-navy bg-white text-kmc-navy text-base font-bold flex items-center justify-center gap-2"
      >
        {t('wardInfo.more')}
        <ChevronRight className="w-5 h-5" aria-hidden="true" />
      </button>
    </CitizenLayout>
  );
};

const NOTICE_ICON = { Emergency: AlertTriangle, Budget: Banknote, WardUpdate: MapPin, Initiative: Megaphone, Scheme: Megaphone } as const;

/** Notices & Alerts for the citizen's ward and the whole city. */
export const Notices: React.FC = () => {
  const { t } = usePrefs();
  const { notifications } = useApp();
  const { currentUser } = useAuth();
  const wardId = currentUser?.assignedWardIds?.[0] || 27;
  // Staff-facing reopen alerts are not citizen notices
  const list = notifications.filter((n) => (!n.wardId || n.wardId === wardId) && !n.title.includes('reopened'));

  return (
    <CitizenLayout title={t('notices.title')}>
      {list.length === 0 ? (
        <EmptyState title={t('notices.empty')} />
      ) : (
        <ul className="space-y-3">
          {list.map((n) => {
            const Icon = NOTICE_ICON[n.type] || Megaphone;
            const urgent = n.urgency === 'high';
            return (
              <li key={n.id} className={`bg-white rounded-2xl border-2 p-4 flex gap-3 ${urgent ? 'border-red-300' : 'border-slate-200'}`}>
                <span className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${urgent ? 'bg-red-50 text-red-700' : 'bg-blue-50 text-kmc-navy'}`}>
                  <Icon className="w-6 h-6" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <p className="text-lg font-bold">{n.title}</p>
                  <p className="text-base text-slate-700">{n.message}</p>
                  <p className="text-sm text-slate-500 mt-1">{n.timestamp}</p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </CitizenLayout>
  );
};

/** Public "Resolved Works Gallery": recent fixed complaints with before/after, filtered by ward. */
export const ResolvedGallery: React.FC = () => {
  const { t } = usePrefs();
  const { grievances, wards } = useApp();
  const [ward, setWard] = useState<number | 'all'>('all');
  const [open, setOpen] = useState<GrievanceItem | null>(null);

  const fixed = useMemo(
    () => grievances.filter((g) => g.status === 'Resolved' && getBeforePhotos(g).length && getAfterPhotos(g).length),
    [grievances]
  );
  const wardIds = Array.from(new Set(fixed.map((g) => g.wardId))).sort((a, b) => a - b);
  const shown = fixed.filter((g) => ward === 'all' || g.wardId === ward);

  return (
    <CitizenLayout title={t('gallery.title')}>
      <p className="text-base text-slate-700">{t('gallery.subtitle')}</p>
      <label htmlFor="gallery-ward" className="block mt-4 text-base font-semibold">{t('gallery.filter')}</label>
      <div className="mt-1 w-full sm:w-80">
        <SearchableSelect
          id="gallery-ward"
          value={ward}
          onChange={(val) => setWard(val)}
          size="lg"
          fullWidth
          searchPlaceholder="Search ward..."
          options={[
            { value: 'all', label: t('common.allWards'), sublabel: 'View across all municipal wards' },
            ...wardIds.map((id) => ({
              value: id,
              label: `Ward ${id} – ${wards.find((w) => w.id === id)?.name || ''}`,
            })),
          ]}
        />
      </div>

      <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {shown.length === 0 ? (
          <div className="sm:col-span-2"><EmptyState title={t('gallery.empty')} /></div>
        ) : (
          shown.map((g) => {
            const cat = categoryFor(g.category);
            const problem = t(`report.cat.${cat.key}`);
            const beforePhotos = getBeforePhotos(g);
            const afterPhotos = getAfterPhotos(g);
            const b = beforePhotos[0];
            const a = afterPhotos[0];

            return (
              <div
                key={g.id}
                className="bg-white rounded-2xl border-2 border-slate-200 overflow-hidden flex flex-col justify-between shadow-sm hover:border-kmc-navy transition-colors"
              >
                {/* Header with Grievance ID, Ward, and Status */}
                <div className="p-3.5 border-b border-slate-100 flex items-center justify-between gap-2 bg-slate-50/70">
                  <div className="flex items-center gap-2 flex-wrap min-w-0">
                    <span className="font-mono text-xs font-bold text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200 shadow-2xs">
                      {g.id}
                    </span>
                    <span className="font-mono text-xs font-bold text-purple-900 bg-purple-100 px-2 py-0.5 rounded">
                      {t('Ward')} {g.wardId}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full whitespace-nowrap">
                    {t('Fixed')}
                  </span>
                </div>

                {/* Independent Before and After Photos with FullImagePreview (click to view large without cropping) */}
                <div className="grid grid-cols-2 gap-2 p-2.5 bg-slate-950/5">
                  <div className="min-w-0">
                    <FullImagePreview
                      src={b?.src}
                      alt={t('detail.beforeAlt', { problem })}
                      title={`${g.id} · ${t('detail.before')}`}
                      caption={`${problem} – ${g.location}`}
                      location={b?.location || g.location}
                      date={b?.takenAt || g.reportedOn}
                      badge={t('detail.before')}
                      badgeVariant="before"
                      variant="card"
                      className="!min-h-[140px] sm:!h-48 bg-slate-950"
                      imgClassName="object-contain"
                      clickable={true}
                      fallbackText={t('Photo unavailable')}
                    />
                  </div>
                  <div className="min-w-0">
                    <FullImagePreview
                      src={a?.src}
                      alt={t('detail.afterAlt', { problem })}
                      title={`${g.id} · ${t('detail.after')}`}
                      caption={`${problem} – ${g.location}`}
                      location={a?.location || g.location}
                      date={a?.takenAt || g.reportedOn}
                      badge={t('detail.after')}
                      badgeVariant="after"
                      variant="card"
                      className="!min-h-[140px] sm:!h-48 bg-slate-950"
                      imgClassName="object-contain"
                      clickable={true}
                      fallbackText={t('Photo unavailable')}
                    />
                  </div>
                </div>

                {/* Details & Interactive Comparison button */}
                <div className="p-3.5 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-base font-bold text-slate-900 truncate">{problem}</p>
                    <p className="text-xs text-slate-600 truncate flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-red-600 shrink-0" aria-hidden="true" />
                      {g.location}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setOpen(g)}
                    className="shrink-0 px-3 py-1.5 rounded-xl border border-kmc-navy text-kmc-navy hover:bg-kmc-navy/5 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                    aria-label={`${t('Compare')} ${g.id}`}
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>{t('Compare')}</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {open && (
        <div className="fixed inset-0 z-[75] bg-slate-950/60 flex items-end sm:items-center justify-center p-3" onClick={() => setOpen(null)}>
          <div
            role="dialog"
            aria-modal="true"
            aria-label={t(`report.cat.${categoryFor(open.category).key}`)}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl p-4"
          >
            <div className="flex items-center justify-between gap-3 mb-3">
              <h2 className="text-xl font-bold font-body tracking-normal">{t(`report.cat.${categoryFor(open.category).key}`)} · {open.location}</h2>
              <button type="button" onClick={() => setOpen(null)} aria-label={t('common.close')} className="w-12 h-12 rounded-full hover:bg-slate-100 flex items-center justify-center shrink-0">
                <X className="w-6 h-6" aria-hidden="true" />
              </button>
            </div>
            <BeforeAfterViewer before={getBeforePhotos(open)} after={getAfterPhotos(open)} problem={t(`report.cat.${categoryFor(open.category).key}`).toLowerCase()} />
          </div>
        </div>
      )}
    </CitizenLayout>
  );
};
