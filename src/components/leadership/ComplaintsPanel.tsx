import React, { useMemo, useState } from 'react';
import { AlertOctagon, Search, X, ChevronRight, ImageOff, HelpCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { GrievanceItem, getAfterPhotos, getBeforePhotos } from '../../data/grievances';
import { ESCALATION_LADDER } from '../../data/departments';
import { resolvePhoto } from '../../photos/photoStore';
import { BeforeAfterViewer } from '../photos/BeforeAfterViewer';
import { CitizenStatus } from '../photos/CitizenStatus';
import { SearchableSelect } from '../common/SearchableSelect';
import { usePrefs } from '../../i18n';

/** Read-only complaint viewer for leadership (same Before/After viewer citizens see). */
export const ComplaintViewerModal: React.FC<{ complaint: GrievanceItem; onClose: () => void }> = ({ complaint, onClose }) => {
  const { t } = usePrefs();
  const level = ESCALATION_LADDER.find((l) => l.level === (complaint.escalationLevel || 1));
  return (
    <div className="fixed inset-0 z-[75] bg-slate-950/60 flex items-end sm:items-center justify-center p-3" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="viewer-title"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-white text-slate-900 rounded-2xl p-5"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 id="viewer-title" className="text-lg font-bold">{t(complaint.category)}: {t(complaint.description)}</h2>
            <p className="text-sm font-mono text-slate-500">{complaint.id} · {t('Ward')} {complaint.wardId} · {t(complaint.location)}</p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <CitizenStatus status={complaint.status} />
              <span className="text-sm text-slate-700">{t('Escalation level')} {complaint.escalationLevel || 1}: {t(level?.title || '')}</span>
            </div>
          </div>
          <button type="button" onClick={onClose} aria-label={t('Close')} className="w-12 h-12 rounded-full hover:bg-slate-100 flex items-center justify-center shrink-0">
            <X className="w-6 h-6" aria-hidden="true" />
          </button>
        </div>
        <div className="mt-4">
          <BeforeAfterViewer before={getBeforePhotos(complaint)} after={getAfterPhotos(complaint)} problem={complaint.category.toLowerCase()} />
        </div>
        <ol className="mt-5 space-y-3 border-t border-slate-100 pt-4">
          {(complaint.timeline || []).map((s, i) => (
            <li key={i} className="text-sm">
              <span className="font-bold">{t(s.title)}</span> <span className="text-slate-500">· {s.time}</span>
              <p className="text-slate-700">{t(s.note)}</p>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
};

/** Complaints citizens reopened ("Not solved"); each was escalated one level up the ladder. */
export const ReopenedAlerts: React.FC<{ onOpen: (g: GrievanceItem) => void }> = ({ onOpen }) => {
  const { grievances } = useApp();
  const { t } = usePrefs();
  const reopened = grievances.filter((g) => g.status === 'Reopened');
  return (
    <section data-tour="reopened" className={`rounded-xl border-2 p-5 ${reopened.length ? 'bg-red-50 border-red-300' : 'bg-white border-slate-200'}`}>
      <div className="flex items-start gap-3">
        <AlertOctagon className={`w-6 h-6 shrink-0 ${reopened.length ? 'text-red-700' : 'text-slate-500'}`} aria-hidden="true" />
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-bold font-heading uppercase text-slate-900">{t('Reopened by Citizens – Escalated')}</h3>
          <p className="text-sm text-slate-700">{t('Citizens said "Not solved". Each complaint moved one level up the escalation ladder.')}</p>
          {reopened.length === 0 ? (
            <p className="mt-2 text-base text-slate-600">{t('No reopened complaints. 👍')}</p>
          ) : (
            <ul className="mt-3 space-y-2">
              {reopened.map((g) => {
                const level = ESCALATION_LADDER.find((l) => l.level === (g.escalationLevel || 1));
                return (
                  <li key={g.id}>
                    <button
                      type="button"
                      onClick={() => onOpen(g)}
                      className="w-full text-left rounded-xl bg-white border-2 border-red-200 hover:border-red-500 p-3 flex items-center gap-3"
                    >
                      <span className="flex-1 min-w-0">
                        <span className="block text-base font-bold">{g.id} · {t('Ward')} {g.wardId} · {t(g.category)}</span>
                        <span className="block text-sm text-red-900">{t('Escalated to Level')} {g.escalationLevel}: {t(level?.title || '')}. {t('Reason')}: “{t(g.reopenReason || '')}”</span>
                      </span>
                      <ChevronRight className="w-5 h-5 text-slate-500 shrink-0" aria-hidden="true" />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
};

/** Recent complaints with ward dropdown + search; any row opens the read-only viewer. */
export const RecentComplaints: React.FC<{ onOpen: (g: GrievanceItem) => void }> = ({ onOpen }) => {
  const { grievances, wards } = useApp();
  const { t } = usePrefs();
  const [ward, setWard] = useState<number | 'all'>('all');
  const [query, setQuery] = useState('');
  const [showAll, setShowAll] = useState(false);

  const matchingWards = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return null;
    return new Set(wards.filter((w) => String(w.id) === q || w.name.toLowerCase().includes(q)).map((w) => w.id));
  }, [query, wards]);

  const list = grievances.filter(
    (g) => (ward === 'all' || g.wardId === ward) && (!matchingWards || matchingWards.has(g.wardId) || g.id.toLowerCase().includes(query.trim().toLowerCase()))
  );
  const shown = showAll ? list : list.slice(0, 6);

  return (
    <section data-tour="complaints" className="bg-white rounded-xl shadow-card border border-slate-200 p-5">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 pb-3 mb-4 border-b border-slate-100">
        <div>
          <h3 className="text-base font-bold font-heading uppercase text-slate-800">{t('Recent Complaints')}</h3>
          <p className="text-sm text-slate-600 flex items-center gap-1.5">
            <HelpCircle className="w-4 h-4 text-kmc-navy" aria-hidden="true" />
            {t('Tap a complaint to see its before and after photos.')}
          </p>
        </div>
        <div className="w-full sm:w-80">
          <label className="sr-only" htmlFor="lead-ward">{t('Ward or search')}</label>
          <SearchableSelect
            id="lead-ward"
            value={ward}
            onChange={(val) => setWard(val)}
            allowFreeTextSearch
            searchQuery={query}
            onSearchQueryChange={setQuery}
            searchPlaceholder={t('Search ward, complaint ID, or keyword...')}
            placeholder={t('All Wards (Search or select)')}
            options={[
              { value: 'all', label: t('All Wards'), sublabel: t('Show complaints across all 66 municipal wards') },
              ...wards.map((w) => ({
                value: w.id,
                label: `${t('Ward')} ${w.id} – ${t(w.name)}`,
                sublabel: w.corporator ? `${t('Ward Corporator')}: ${w.corporator}` : undefined,
              })),
            ]}
            className="w-full"
            size="md"
          />
        </div>
      </div>

      {shown.length === 0 ? (
        <p className="text-base text-slate-600">{t('No complaints match. Try "All Wards" or clear the search.')}</p>
      ) : (
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {shown.map((g) => {
            const photo = getBeforePhotos(g)[0];
            return (
              <li key={g.id}>
                <button type="button" onClick={() => onOpen(g)} className="w-full text-left rounded-xl border-2 border-slate-200 hover:border-kmc-navy p-3 flex items-center gap-3">
                  <span className="w-16 h-16 rounded-lg overflow-hidden bg-slate-950 shrink-0 flex items-center justify-center border border-slate-300">
                    {photo ? <img src={resolvePhoto(photo.src)} alt={`${t('Before photo of')} ${t(g.category.toLowerCase())}`} loading="lazy" className="w-full h-full object-contain" /> : <ImageOff className="w-6 h-6 text-slate-500" aria-hidden="true" />}
                  </span>
                  <span className="flex-1 min-w-0 space-y-1">
                    <span className="block text-sm font-bold truncate">{t(g.category)}: {t(g.description)}</span>
                    <span className="block text-xs font-mono text-slate-500">{g.id} · {t('Ward')} {g.wardId}</span>
                    <CitizenStatus status={g.status} />
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
      {list.length > 6 && (
        <button type="button" onClick={() => setShowAll((v) => !v)} aria-expanded={showAll} className="mt-4 min-h-[44px] px-4 rounded-lg border-2 border-slate-300 text-sm font-semibold">
          {showAll ? t('Show less') : `${t('Show more')} (${list.length - 6})`}
        </button>
      )}
    </section>
  );
};
