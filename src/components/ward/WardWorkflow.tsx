import React, { useState } from 'react';
import { Send, CheckCircle2, RotateCcw, ImageOff, MapPin, HelpCircle, AlertTriangle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../auth/AuthContext';
import { useToast } from '../../ui/Toast';
import { GrievanceItem, getAfterPhotos, getBeforePhotos, INITIAL_GRIEVANCES } from '../../data/grievances';
import { resolvePhoto } from '../../photos/photoStore';
import { BeforeAfterViewer } from '../photos/BeforeAfterViewer';
import { CitizenStatus } from '../photos/CitizenStatus';
import { SearchableSelect } from '../common/SearchableSelect';
import { userRepository, staffCategoryRepository } from '../../storage';
import { usePrefs } from '../../i18n';
import { FullImagePreview } from '../common/FullImagePreview';

const PanelHeader: React.FC<{ title: string; help: string; count: number }> = ({ title, help, count }) => {
  const { t } = usePrefs();
  return (
    <div className="flex items-start justify-between gap-3 pb-3 mb-4 border-b border-slate-100">
      <div>
        <h3 className="text-sm sm:text-base font-bold font-heading uppercase text-slate-800">{t(title)}</h3>
        <p className="text-sm text-slate-600 flex items-center gap-1.5 mt-0.5">
          <HelpCircle className="w-4 h-4 text-kmc-navy shrink-0" aria-hidden="true" />
          {t(help)}
        </p>
      </div>
      <span className="text-sm font-bold bg-slate-100 text-slate-800 px-3 py-1 rounded-full shrink-0">{count}</span>
    </div>
  );
};

const corporatorName = (role?: string, name?: string, wardCorp?: string) => (role === 'corporator' ? name : wardCorp) || 'Ward Corporator';

/** Deck Page 13 step 2–3: the corporator validates each new complaint and sends it to field staff. */
export const NewComplaintsQueue: React.FC<{ wardId: number }> = ({ wardId }) => {
  const { grievances, tasks, routeComplaint, wards } = useApp();
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const { t } = usePrefs();
  const [staff, setStaff] = useState<Record<string, string>>({});
  const corp = corporatorName(currentUser?.role, currentUser?.displayName, wards.find((w) => w.id === wardId)?.corporator);

  const queue = grievances.filter(
    (g) => g.wardId === wardId && g.status === 'Pending' && !tasks.some((t) => t.grievanceId === g.id && t.status !== 'Pending')
  );

  return (
    <section data-tour="new-complaints" className="bg-white rounded-xl shadow-card border border-slate-200 p-5">
      <PanelHeader title="New Complaints – Review / Validate / Categorize" help="Check each new complaint and send it to field staff." count={queue.length} />
      {queue.length === 0 ? (
        <p className="text-base text-slate-600">{t('No new complaints waiting. New ones appear here as soon as a citizen reports them.')}</p>
      ) : (
        <ul className="space-y-3">
          {queue.map((g) => {
            const photo = getBeforePhotos(g)[0];
            const requiredCategory = staffCategoryRepository.findRequiredCategoryForGrievance(g.category, g.department);
            const eligibleStaff = staffCategoryRepository.getEligibleStaffForGrievance(g);
            const chosen = staff[g.id] || (eligibleStaff.length > 0 ? eligibleStaff[0].displayName : '');
            return (
              <li key={g.id} className="rounded-xl border-2 border-slate-200 p-3 flex flex-col md:flex-row md:items-center gap-3">
                <div className="w-full md:w-28 h-40 md:h-28 rounded-lg overflow-hidden shrink-0">
                  {photo ? (
                    <FullImagePreview
                      src={photo.src}
                      alt={`Before photo of ${g.category.toLowerCase()}`}
                      title={`${g.category}: ${g.description}`}
                      location={photo.location}
                      date={photo.takenAt}
                      badge="BEFORE"
                      badgeVariant="before"
                      className="w-full h-full"
                    />
                  ) : (
                    <div className="w-full h-full bg-slate-100 rounded-lg flex items-center justify-center text-slate-400">
                      <ImageOff className="w-7 h-7 text-slate-500" aria-hidden="true" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-base font-bold">{t(g.category)}: {g.description}</p>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200">
                      {t('Requires')}: {t(requiredCategory.name)}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 flex items-center gap-1"><MapPin className="w-4 h-4" aria-hidden="true" />{t(g.location)}</p>
                  <p className="text-sm font-mono text-slate-500">{g.id} · {g.reportedOn} · {t(g.department)}</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 md:w-auto items-stretch sm:items-center">
                  <label className="sr-only" htmlFor={`staff-${g.id}`}>{t('Field staff for {{id}}', { id: g.id })}</label>
                  {eligibleStaff.length === 0 ? (
                    <div className="text-xs text-amber-900 bg-amber-50 border border-amber-300 px-3 py-2 rounded-xl flex items-center gap-1.5 max-w-sm">
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>
                        <strong>{t('Awaiting Assignment:')}</strong> {t('No active')} <em>{t(requiredCategory.name)}</em> {t('in Ward {{ward}}.', { ward: g.wardId })}
                      </span>
                    </div>
                  ) : (
                    <SearchableSelect
                      id={`staff-${g.id}`}
                      value={chosen}
                      onChange={(val) => setStaff((s) => ({ ...s, [g.id]: val }))}
                      searchPlaceholder={t('Search {{name}}...', { name: t(requiredCategory.name) })}
                      options={eligibleStaff.map((s) => ({
                        value: s.displayName,
                        label: s.displayName,
                        sublabel: `${t(s.staffCategory || s.roleTitle)} • ${t(s.departmentName)}`,
                      }))}
                      size="md"
                      className="w-full sm:w-60"
                    />
                  )}
                  <button
                    type="button"
                    disabled={eligibleStaff.length === 0 || !chosen}
                    onClick={() => {
                      if (!chosen) return;
                      routeComplaint(g.id, chosen, corp);
                      toast(t('{{id}} sent to {{staff}}.', { id: g.id, staff: chosen }));
                    }}
                    className="min-h-[44px] px-4 rounded-xl bg-kmc-navy hover:bg-kmc-navy-light disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-bold flex items-center justify-center gap-2 transition-colors shrink-0"
                  >
                    <Send className="w-4 h-4" aria-hidden="true" />
                    {t('Validate & Send')}
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
};

/** After photos waiting for the corporator: Approve & Close, or Send Back with a reason. */
export const VerificationQueue: React.FC<{ wardId: number }> = ({ wardId }) => {
  const { grievances, approveAndClose, sendBackComplaint, wards } = useApp();
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const { t } = usePrefs();
  const [sendingBack, setSendingBack] = useState<string | null>(null);
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);
  const corp = corporatorName(currentUser?.role, currentUser?.displayName, wards.find((w) => w.id === wardId)?.corporator);

  const queue = grievances.filter((g) => g.wardId === wardId && g.status === 'Completed');

  return (
    <section data-tour="verify" className="bg-white rounded-xl shadow-card border-2 border-sky-300 p-5">
      <PanelHeader
        title="Work Completed – Waiting for Verification"
        help="Compare the before and after photos, then approve or send back."
        count={queue.length}
      />
      {queue.length === 0 ? (
        <p className="text-base text-slate-600">{t('Nothing to check right now. Work appears here after field staff upload the after photo.')}</p>
      ) : (
        <div className="space-y-6">
          {queue.map((g) => (
            <article key={g.id} className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-base font-bold">{t(g.category)}: {g.description}</span>
                <span className="text-sm font-mono text-slate-500">{g.id}</span>
                <CitizenStatus status={g.status} />
              </div>
              <BeforeAfterViewer before={getBeforePhotos(g)} after={getAfterPhotos(g)} problem={t(g.category.toLowerCase())} />
              {sendingBack === g.id ? (
                <div className="rounded-xl border-2 border-amber-300 bg-amber-50 p-3 space-y-2">
                  <label htmlFor={`reason-${g.id}`} className="block text-base font-semibold">{t('Why is the work sent back? (required)')}</label>
                  <textarea id={`reason-${g.id}`} rows={2} value={reason} onChange={(e) => setReason(e.target.value)} className="w-full rounded-xl border-2 border-slate-300 p-3 text-base" placeholder={t('For example: the drain cover is still broken')} />
                  {error && <p role="alert" className="text-base text-rose-900">{error}</p>}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <button type="button" onClick={() => { setSendingBack(null); setError(null); }} className="min-h-[48px] rounded-xl border-2 border-slate-300 bg-white text-base font-semibold">{t('Cancel')}</button>
                    <button
                      type="button"
                      onClick={() => {
                        const res = sendBackComplaint(g.id, reason, corp);
                        if (!res.ok) return setError(res.error || t('Please write a reason.'));
                        setSendingBack(null);
                        setReason('');
                        setError(null);
                        toast(t('{{id}} sent back to field staff.', { id: g.id }), 'info');
                      }}
                      className="min-h-[48px] rounded-xl bg-amber-600 text-white text-base font-bold"
                    >
                      {t('Send Back')}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      approveAndClose(g.id, corp);
                      toast(t('{{id}} approved and closed. The citizen got an SMS.', { id: g.id }));
                    }}
                    className="min-h-[52px] rounded-xl bg-kmc-green text-white text-base font-bold flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-5 h-5" aria-hidden="true" />
                    {t('Approve & Resolve')}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setSendingBack(g.id); setReason(''); setError(null); }}
                    className="min-h-[52px] rounded-xl border-2 border-amber-600 text-amber-800 bg-white text-base font-bold flex items-center justify-center gap-2"
                  >
                    <RotateCcw className="w-5 h-5" aria-hidden="true" />
                    {t('Send Back')}
                  </button>
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  );
};

/**
 * Deck Page 6 "Before / After Evidence": newest complaints with real uploaded photos first,
 * then the deck's sample cases GRV-2024-27-0045 and GRV-2024-27-0082 with built-in photos.
 */
export const EvidenceCards: React.FC<{ wardId: number }> = ({ wardId }) => {
  const { grievances } = useApp();
  const { t } = usePrefs();
  const seeded = new Set(INITIAL_GRIEVANCES.map((g) => g.id));
  const withPhotos = grievances.filter((g) => g.wardId === wardId && getBeforePhotos(g).length);
  const fresh = withPhotos.filter((g) => !seeded.has(g.id));
  const samples = ['GRV-2024-27-0045', 'GRV-2024-27-0082']
    .map((id) => withPhotos.find((g) => g.id === id))
    .filter((g): g is GrievanceItem => !!g);
  const cards = [...fresh, ...samples, ...withPhotos.filter((g) => seeded.has(g.id) && !samples.includes(g))].slice(0, 2);

  if (cards.length === 0) return null;
  return (
    <section className="bg-white rounded-xl shadow-card border border-slate-200 p-5">
      <PanelHeader title="Before / After Evidence" help="Geo-tagged photos from the citizen and from field staff. Tap a photo to enlarge." count={cards.length} />
      <div className="space-y-6">
        {cards.map((g) => (
          <article key={g.id}>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="text-sm font-mono font-bold text-kmc-navy">{t('Case ID')}: {g.id}</span>
              <span className="text-base font-bold">{g.description}</span>
              <CitizenStatus status={g.status} />
            </div>
            <BeforeAfterViewer before={getBeforePhotos(g)} after={getAfterPhotos(g)} problem={t(g.category.toLowerCase())} compact />
          </article>
        ))}
      </div>
    </section>
  );
};
