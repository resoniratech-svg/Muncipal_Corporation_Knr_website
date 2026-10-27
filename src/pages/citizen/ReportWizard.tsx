import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, LocateFixed, Lightbulb, Loader2, AlertCircle, MessageSquareText } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../auth/AuthContext';
import { usePrefs } from '../../i18n';
import { useToast } from '../../ui/Toast';
import { PROBLEM_CATEGORIES, ProblemCategory } from '../../data/categories';
import { storePhotos, resolvePhoto } from '../../photos/photoStore';
import { wardCoords } from '../../photos/geo';
import { PhotoPicker } from '../../components/photos/PhotoPicker';
import { CitizenLayout } from './CitizenLayout';
import { SearchableSelect } from '../../components/common/SearchableSelect';
import { FullImagePreview } from '../../components/common/FullImagePreview';

const STEP_KEYS = ['report.stepChoose', 'report.stepPhoto', 'report.stepLocation', 'report.stepReview'];

/** Report a Problem: 4 steps, one question each, big Next / Back buttons and a progress bar. */
export const ReportWizard: React.FC = () => {
  const navigate = useNavigate();
  const { submitGrievance, wards } = useApp();
  const { currentUser } = useAuth();
  const { t } = usePrefs();
  const { toast } = useToast();

  const homeWard = currentUser?.assignedWardIds?.[0] || 27;
  const [step, setStep] = useState(0);
  const [category, setCategory] = useState<ProblemCategory | null>(null);
  const [photos, setPhotos] = useState<string[]>([]);
  const [wardId, setWardId] = useState(homeWard);
  const [landmark, setLandmark] = useState('');
  const [note, setNote] = useState('');
  const [located, setLocated] = useState<string | null>(null);
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState<{ id: string; time: string } | null>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);

  // Move focus to the question so screen readers announce each step
  useEffect(() => {
    headingRef.current?.focus();
  }, [step, done]);

  const ward = wards.find((w) => w.id === wardId);
  const place = `${landmark.trim() || located || ''}${ward ? `, Ward ${ward.id} – ${ward.name}` : ''}`.replace(/^, /, '');
  const categoryLabel = category ? t(`report.cat.${category.key}`) : '';

  const useMyLocation = () => {
    setLocating(true);
    setError(null);
    // Mock location: the citizen's home ward and a sample landmark
    setTimeout(() => {
      const home = wards.find((w) => w.id === homeWard);
      setWardId(homeWard);
      const spot = homeWard === 27 ? 'Green Park Colony main road' : `${home?.name || `Ward ${homeWard}`} main road`;
      setLocated(spot);
      if (!landmark.trim()) setLandmark(spot);
      setLocating(false);
    }, 700);
  };

  const next = () => {
    setError(null);
    if (step === 0 && !category) return setError(t('report.pickCategory'));
    if (step === 2 && !landmark.trim() && !located) return setError(t('report.landmarkNeeded'));
    setStep((s) => Math.min(3, s + 1));
  };

  const back = () => {
    setError(null);
    if (step === 0) navigate('/citizen');
    else setStep((s) => s - 1);
  };

  const submit = () => {
    if (!category) return;
    setSending(true);
    const coords = wardCoords(wardId);
    const stored = storePhotos(photos, place, coords.lat, coords.lng);
    if (!stored.ok) {
      setSending(false);
      setError(t('photoError.quota'));
      return;
    }
    const created = submitGrievance(
      {
        citizenId: currentUser?.role === 'citizen' ? currentUser.id : 'USR-CITIZEN-01',
        category: category.category,
        department: category.department,
        description: note.trim() || `${category.category} problem reported by citizen`,
        location: place,
        wardId,
        slaHours: category.slaHours,
        latitude: coords.lat,
        longitude: coords.lng,
        beforePhotos: stored.photos,
      },
      currentUser?.displayName
    );
    setSending(false);
    setDone({ id: created.id, time: created.reportedOn });
    toast(t('success.title'));
  };

  if (done) {
    return (
      <CitizenLayout title={t('report.title')}>
        <div className="bg-white rounded-2xl border-2 border-emerald-300 shadow-card p-6 text-center">
          <CheckCircle2 className="w-16 h-16 text-emerald-700 mx-auto" aria-hidden="true" />
          <h2 ref={headingRef} tabIndex={-1} className="mt-3 text-2xl font-bold font-body tracking-normal outline-none">{t('success.title')}</h2>
          <dl className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
            <div className="rounded-xl bg-slate-50 border-2 border-slate-200 p-4">
              <dt className="text-sm font-semibold text-slate-600">{t('success.idLabel')}</dt>
              <dd className="text-2xl font-bold font-mono text-kmc-navy mt-1" data-testid="complaint-id">{done.id}</dd>
            </div>
            <div className="rounded-xl bg-slate-50 border-2 border-slate-200 p-4">
              <dt className="text-sm font-semibold text-slate-600">{t('success.time')}</dt>
              <dd className="text-lg font-bold mt-1">{done.time}</dd>
            </div>
          </dl>
          <div className="mt-5 rounded-xl bg-blue-50 border-2 border-blue-200 p-4 text-left">
            <p className="text-base font-bold text-blue-950">{t('success.nextTitle')}</p>
            <p className="text-base text-blue-950 mt-1">{t('success.nextText')}</p>
          </div>
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => navigate(`/citizen/track/${encodeURIComponent(done.id)}`)}
              className="min-h-[52px] rounded-xl bg-kmc-navy text-white text-base font-bold"
            >
              {t('success.trackBtn')}
            </button>
            <button type="button" onClick={() => navigate('/citizen')} className="min-h-[52px] rounded-xl border-2 border-kmc-navy text-kmc-navy text-base font-bold">
              {t('success.homeBtn')}
            </button>
          </div>
        </div>
      </CitizenLayout>
    );
  }

  return (
    <CitizenLayout title={t('report.title')}>
      {/* Progress bar */}
      <div>
        <div className="flex justify-between text-base font-semibold text-slate-700">
          <span>{t('report.stepOf', { n: step + 1 })}</span>
          <span>{t(STEP_KEYS[step])}</span>
        </div>
        <div
          className="mt-2 h-3 rounded-full bg-slate-200 overflow-hidden"
          role="progressbar"
          aria-valuemin={1}
          aria-valuemax={4}
          aria-valuenow={step + 1}
          aria-label={t('report.stepOf', { n: step + 1 })}
        >
          <div className="h-full bg-kmc-green transition-all motion-reduce:transition-none" style={{ width: `${((step + 1) / 4) * 100}%` }} />
        </div>
        <ol className="mt-2 hidden sm:grid grid-cols-4 gap-2 text-sm text-slate-600">
          {STEP_KEYS.map((k, i) => (
            <li key={k} className={i === step ? 'font-bold text-slate-900' : ''}>{i + 1}. {t(k)}</li>
          ))}
        </ol>
      </div>

      <section className="mt-6 bg-white rounded-2xl border-2 border-slate-200 shadow-card p-5">
        {step === 0 && (
          <>
            <h2 ref={headingRef} tabIndex={-1} className="text-2xl font-bold font-body tracking-normal outline-none">{t('report.q1')}</h2>
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3" role="radiogroup" aria-label={t('report.q1')}>
              {PROBLEM_CATEGORIES.map((c) => {
                const Icon = c.icon;
                const selected = category?.key === c.key;
                return (
                  <button
                    key={c.key}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    onClick={() => {
                      setCategory(c);
                      setError(null);
                    }}
                    className={`min-h-[112px] rounded-2xl border-2 p-3 flex flex-col items-center justify-center gap-2 text-lg font-bold transition-colors ${
                      selected ? 'border-kmc-navy bg-blue-50 text-kmc-navy ring-2 ring-kmc-navy' : 'border-slate-200 bg-white hover:border-kmc-navy'
                    }`}
                  >
                    <Icon className="w-10 h-10" aria-hidden="true" />
                    {t(`report.cat.${c.key}`)}
                  </button>
                );
              })}
            </div>
          </>
        )}

        {step === 1 && (
          <>
            <h2 ref={headingRef} tabIndex={-1} className="text-2xl font-bold font-body tracking-normal outline-none">{t('report.q2')}</h2>
            <p className="mt-1 text-base text-slate-600">{t('report.photoHelp')}</p>
            <div className="mt-4">
              <PhotoPicker photos={photos} onChange={setPhotos} altPrefix={t('detail.beforeAlt', { problem: categoryLabel })} />
            </div>
            {photos.length === 0 && (
              <p className="mt-4 flex items-start gap-2 rounded-xl bg-amber-50 border-2 border-amber-200 p-3 text-base text-amber-950">
                <Lightbulb className="w-5 h-5 shrink-0 mt-0.5" aria-hidden="true" />
                {t('report.photoTip')}
              </p>
            )}
          </>
        )}

        {step === 2 && (
          <>
            <h2 ref={headingRef} tabIndex={-1} className="text-2xl font-bold font-body tracking-normal outline-none">{t('report.q3')}</h2>
            <button
              type="button"
              onClick={useMyLocation}
              disabled={locating}
              className="mt-4 w-full min-h-[56px] rounded-xl bg-kmc-navy text-white text-base font-bold flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {locating ? <Loader2 className="w-6 h-6 animate-spin motion-reduce:animate-none" aria-hidden="true" /> : <LocateFixed className="w-6 h-6" aria-hidden="true" />}
              {locating ? t('report.locating') : t('report.useLocation')}
            </button>
            {located && (
              <p className="mt-3 flex items-center gap-2 text-base text-emerald-900" role="status">
                <CheckCircle2 className="w-5 h-5" aria-hidden="true" />
                {t('report.located', { place: `${located}, Ward ${wardId}` })}
              </p>
            )}
            <label htmlFor="report-ward" className="block mt-5 text-base font-semibold">{t('report.wardLabel')}</label>
            <div className="mt-1">
              <SearchableSelect
                id="report-ward"
                value={wardId}
                onChange={(val) => setWardId(Number(val))}
                size="lg"
                fullWidth
                searchPlaceholder="Search 66 wards..."
                options={wards.map((w) => ({
                  value: w.id,
                  label: `Ward ${w.id} – ${w.name}`,
                  sublabel: w.corporator ? `Corporator: ${w.corporator}` : undefined,
                }))}
              />
            </div>
            <label htmlFor="report-landmark" className="block mt-4 text-base font-semibold">{t('report.landmarkLabel')}</label>
            <input
              id="report-landmark"
              value={landmark}
              onChange={(e) => setLandmark(e.target.value)}
              placeholder={t('report.landmarkPlaceholder')}
              className="mt-1 w-full min-h-[52px] rounded-xl border-2 border-slate-300 px-3 text-base"
            />
          </>
        )}

        {step === 3 && category && (
          <>
            <h2 ref={headingRef} tabIndex={-1} className="text-2xl font-bold font-body tracking-normal outline-none">{t('report.q4')}</h2>
            <dl className="mt-4 space-y-3">
              {[
                { label: t('report.problem'), value: categoryLabel, goTo: 0 },
                { label: t('report.place'), value: place, goTo: 2 },
              ].map((row) => (
                <div key={row.label} className="flex items-center gap-3 rounded-xl bg-slate-50 border-2 border-slate-200 p-4">
                  <div className="flex-1 min-w-0">
                    <dt className="text-sm font-semibold text-slate-600">{row.label}</dt>
                    <dd className="text-lg font-bold break-words">{row.value}</dd>
                  </div>
                  <button type="button" onClick={() => setStep(row.goTo)} className="min-h-[44px] px-3 rounded-lg border-2 border-slate-300 text-base font-semibold">
                    {t('report.edit')}
                  </button>
                </div>
              ))}
              <div className="flex items-center gap-3 rounded-xl bg-slate-50 border-2 border-slate-200 p-4">
                <div className="flex-1 min-w-0">
                  <dt className="text-sm font-semibold text-slate-600">{t('report.photos')}</dt>
                  <dd className="mt-1">
                    {photos.length ? (
                      <span className="flex gap-2">
                        {photos.map((p, i) => (
                          <div key={i} className="w-16 h-16 sm:w-20 sm:h-20 shrink-0">
                            <FullImagePreview
                              src={p}
                              alt={`${t('detail.beforeAlt', { problem: categoryLabel })} ${i + 1}`}
                              title={`${categoryLabel} ${i + 1}`}
                              variant="thumbnail"
                              className="w-full h-full"
                            />
                          </div>
                        ))}
                      </span>
                    ) : (
                      <span className="text-lg font-bold">{t('report.noPhotos')}</span>
                    )}
                  </dd>
                </div>
                <button type="button" onClick={() => setStep(1)} className="min-h-[44px] px-3 rounded-lg border-2 border-slate-300 text-base font-semibold">
                  {t('report.edit')}
                </button>
              </div>
            </dl>
            <label htmlFor="report-note" className="mt-5 flex items-center gap-2 text-base font-semibold">
              <MessageSquareText className="w-5 h-5" aria-hidden="true" />
              {t('report.noteLabel')}
            </label>
            <textarea
              id="report-note"
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={t('report.notePlaceholder')}
              className="mt-1 w-full rounded-xl border-2 border-slate-300 p-3 text-base"
            />
          </>
        )}

        {error && (
          <p role="alert" className="mt-4 flex items-start gap-2 rounded-xl border-2 border-rose-300 bg-rose-50 p-3 text-base text-rose-900">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" aria-hidden="true" />
            {error}
          </p>
        )}
      </section>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <button type="button" onClick={back} className="min-h-[56px] rounded-xl border-2 border-kmc-navy bg-white text-kmc-navy text-lg font-bold">
          {t('common.back')}
        </button>
        {step < 3 ? (
          <button type="button" onClick={next} className="min-h-[56px] rounded-xl bg-kmc-navy text-white text-lg font-bold">
            {t('common.next')}
          </button>
        ) : (
          <button type="button" onClick={submit} disabled={sending} className="min-h-[56px] rounded-xl bg-kmc-green text-white text-lg font-bold disabled:opacity-70">
            {sending ? t('report.sending') : t('report.submit')}
          </button>
        )}
      </div>
    </CitizenLayout>
  );
};
