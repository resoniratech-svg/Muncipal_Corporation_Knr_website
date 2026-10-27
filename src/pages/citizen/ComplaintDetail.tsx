import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Star, CheckCircle2, RotateCcw, AlertCircle, MapPin, CalendarClock } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../auth/AuthContext';
import { usePrefs } from '../../i18n';
import { useToast } from '../../ui/Toast';
import { getAfterPhotos, getBeforePhotos } from '../../data/grievances';
import { categoryFor } from '../../data/categories';
import { ESCALATION_LADDER } from '../../data/departments';
import { resolvePhoto } from '../../photos/photoStore';
import { BeforeAfterViewer } from '../../components/photos/BeforeAfterViewer';
import { CitizenStatus } from '../../components/photos/CitizenStatus';
import { CitizenLayout } from './CitizenLayout';
import { EmptyState } from './TrackComplaints';
import { FullImagePreview } from '../../components/common/FullImagePreview';

// Standard timeline step titles (stored in English on the record) shown in the citizen's language
const timelineKey = (title: string): string | null => {
  const tl = title.toLowerCase();
  if (tl.startsWith('reopened')) return 'timeline.reopened';
  if (tl.startsWith('sent back')) return 'timeline.sentBack';
  if (tl.startsWith('approved') || tl === 'resolved') return 'timeline.approved';
  if (tl.startsWith('work completed')) return 'timeline.completed';
  if (tl.startsWith('checked by') || tl.startsWith('corporator validated')) return 'timeline.checked';
  if (tl.startsWith('auto-routed') || tl.startsWith('assigned to officer') || tl.startsWith('work assigned')) return 'timeline.routed';
  if (tl.includes('progress')) return 'timeline.inProgress';
  if (tl.includes('registered') || tl.startsWith('issue logged')) return 'timeline.registered';
  return null;
};

export const ComplaintDetail: React.FC = () => {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const { grievances, rateGrievance, reopenComplaint } = useApp();
  const { currentUser } = useAuth();
  const { t, tList } = usePrefs();
  const { toast } = useToast();

  const [mode, setMode] = useState<'ask' | 'rate' | 'reopen'>('ask');
  const [stars, setStars] = useState(0);
  const [comment, setComment] = useState('');
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);

  const citizenId = currentUser?.role === 'citizen' ? currentUser.id : 'USR-CITIZEN-01';
  const g = grievances.find((x) => x.id === decodeURIComponent(id));
  const visible = g && (currentUser?.role === 'super_admin' || g.citizenId === citizenId);

  if (!g || !visible) {
    return (
      <CitizenLayout title={t('detail.title')}>
        <EmptyState title={t('track.notFound')} action={t('track.title')} onAction={() => navigate('/citizen/track')} />
      </CitizenLayout>
    );
  }

  const cat = categoryFor(g.category);
  const problem = t(`report.cat.${cat.key}`);
  const before = getBeforePhotos(g);
  const after = getAfterPhotos(g);
  const starLabels = tList('detail.stars');
  const askVerdict = g.status === 'Resolved' && !g.citizenRating;
  const level = ESCALATION_LADDER.find((l) => l.level === g.escalationLevel);

  const sendRating = () => {
    if (!stars) return setError(t('detail.rateNeeded'));
    rateGrievance(g.id, stars, comment.trim(), citizenId, currentUser?.displayName);
    setError(null);
    toast(t('detail.rateThanks'));
  };

  const sendReopen = () => {
    const res = reopenComplaint(g.id, reason);
    if (!res.ok) return setError(t('detail.reopenNeeded'));
    setError(null);
    setMode('ask');
    toast(t('detail.reopenDone'), 'info');
  };

  return (
    <CitizenLayout title={t('detail.title')}>
      <section className="bg-white rounded-2xl border-2 border-slate-200 p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold font-body tracking-normal">{problem}</h2>
            <p className="text-base font-mono text-slate-600 mt-0.5">{g.id}</p>
          </div>
          <CitizenStatus status={g.status} size="lg" />
        </div>
        <p className="mt-3 flex items-start gap-2 text-base text-slate-700">
          <MapPin className="w-5 h-5 shrink-0 mt-0.5" aria-hidden="true" />
          {g.location}
        </p>
        <p className="mt-1 flex items-center gap-2 text-base text-slate-700">
          <CalendarClock className="w-5 h-5 shrink-0" aria-hidden="true" />
          {t('track.reported', { date: g.reportedOn })}
        </p>
        {g.status === 'Reopened' && level && (
          <p className="mt-3 rounded-xl bg-red-50 border-2 border-red-200 p-3 text-base text-red-950">
            {t('detail.reopenedNote', { level: level.title })}
          </p>
        )}
      </section>

      <section className="mt-5">
        <h3 className="text-xl font-bold font-body tracking-normal mb-3">{t('detail.beforeAfter')}</h3>
        <BeforeAfterViewer before={before} after={after} problem={problem.toLowerCase()} />
      </section>

      {/* Verdict: only after the corporator approved the work */}
      {askVerdict && (
        <section className="mt-5 bg-white rounded-2xl border-2 border-kmc-navy p-5" aria-labelledby="verdict-q">
          <h3 id="verdict-q" className="text-xl font-bold font-body tracking-normal">{t('detail.solvedQ')}</h3>
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => {
                setMode('rate');
                setError(null);
              }}
              aria-pressed={mode === 'rate'}
              className="min-h-[60px] rounded-xl bg-kmc-green text-white text-lg font-bold"
            >
              {t('detail.yesSolved')}
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('reopen');
                setError(null);
              }}
              aria-pressed={mode === 'reopen'}
              className="min-h-[60px] rounded-xl border-2 border-rose-700 text-rose-800 bg-white text-lg font-bold"
            >
              {t('detail.notSolved')}
            </button>
          </div>

          {mode === 'rate' && (
            <div className="mt-5">
              <p className="text-lg font-bold">{t('detail.rateTitle')}</p>
              <div className="mt-2 flex gap-1" role="radiogroup" aria-label={t('detail.rateTitle')}>
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    role="radio"
                    aria-checked={stars === n}
                    aria-label={`${t('detail.star', { n })} – ${starLabels[n - 1] || ''}`}
                    onClick={() => setStars(n)}
                    className="w-12 h-12 rounded-lg flex items-center justify-center hover:bg-amber-50"
                  >
                    <Star className={`w-9 h-9 ${n <= stars ? 'fill-amber-400 text-amber-500' : 'text-slate-500'}`} aria-hidden="true" />
                  </button>
                ))}
              </div>
              {stars > 0 && <p className="text-base font-semibold text-amber-800 mt-1">{starLabels[stars - 1]}</p>}
              <label htmlFor="rate-comment" className="block mt-3 text-base font-semibold">{t('detail.rateComment')}</label>
              <textarea id="rate-comment" rows={3} value={comment} onChange={(e) => setComment(e.target.value)} className="mt-1 w-full rounded-xl border-2 border-slate-300 p-3 text-base" />
              <button type="button" onClick={sendRating} className="mt-3 w-full min-h-[56px] rounded-xl bg-kmc-navy text-white text-lg font-bold">
                {t('detail.rateSend')}
              </button>
            </div>
          )}

          {mode === 'reopen' && (
            <div className="mt-5">
              <label htmlFor="reopen-reason" className="block text-lg font-bold">{t('detail.reopenLabel')}</label>
              <textarea
                id="reopen-reason"
                rows={3}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder={t('detail.reopenPlaceholder')}
                className="mt-2 w-full rounded-xl border-2 border-slate-300 p-3 text-base"
              />
              <button type="button" onClick={sendReopen} className="mt-3 w-full min-h-[56px] rounded-xl bg-rose-700 text-white text-lg font-bold flex items-center justify-center gap-2">
                <RotateCcw className="w-5 h-5" aria-hidden="true" />
                {t('detail.reopenSend')}
              </button>
            </div>
          )}

          {error && (
            <p role="alert" className="mt-4 flex items-start gap-2 rounded-xl border-2 border-rose-300 bg-rose-50 p-3 text-base text-rose-900">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" aria-hidden="true" />
              {error}
            </p>
          )}
        </section>
      )}

      {g.citizenRating ? (
        <section className="mt-5 bg-emerald-50 rounded-2xl border-2 border-emerald-200 p-5 flex items-start gap-3">
          <CheckCircle2 className="w-7 h-7 text-emerald-700 shrink-0" aria-hidden="true" />
          <div>
            <p className="text-lg font-bold text-emerald-950">{t('detail.rated', { n: g.citizenRating })}</p>
            <p className="mt-1 flex gap-0.5" aria-hidden="true">
              {[1, 2, 3, 4, 5].map((n) => (
                <Star key={n} className={`w-6 h-6 ${n <= (g.citizenRating || 0) ? 'fill-amber-400 text-amber-500' : 'text-slate-300'}`} />
              ))}
            </p>
            {g.feedbackComment && <p className="mt-1 text-base text-emerald-950">“{g.feedbackComment}”</p>}
          </div>
        </section>
      ) : null}

      <section className="mt-5 bg-white rounded-2xl border-2 border-slate-200 p-5">
        <h3 className="text-xl font-bold font-body tracking-normal">{t('detail.history')}</h3>
        <ol className="mt-4 space-y-4">
          {(g.timeline || []).map((step, i) => (
            <li key={i} className="flex gap-3">
              <span className="w-3 h-3 rounded-full bg-kmc-navy mt-2 shrink-0" aria-hidden="true" />
              <div className="flex-1 min-w-0">
                <p className="text-base font-bold">{timelineKey(step.title) ? t(timelineKey(step.title)!) : step.title}</p>
                <p className="text-sm text-slate-600">{step.time}</p>
                <p className="text-base text-slate-700 mt-0.5">{step.note}</p>
              </div>
              {step.photo && (
                <div className="w-16 h-16 sm:w-20 sm:h-20 shrink-0">
                  <FullImagePreview
                    src={step.photo}
                    alt={t(after.some((p) => p.src === step.photo) ? 'detail.afterAlt' : 'detail.beforeAlt', { problem: problem.toLowerCase() })}
                    title={step.title}
                    caption={step.note}
                    date={step.time}
                    variant="thumbnail"
                    className="w-full h-full"
                  />
                </div>
              )}
            </li>
          ))}
        </ol>
      </section>
    </CitizenLayout>
  );
};
