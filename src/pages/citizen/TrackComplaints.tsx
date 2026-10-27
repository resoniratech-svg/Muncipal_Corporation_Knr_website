import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Search, ImageOff, AlertCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../auth/AuthContext';
import { usePrefs } from '../../i18n';
import { GrievanceItem, getBeforePhotos } from '../../data/grievances';
import { categoryFor } from '../../data/categories';
import { resolvePhoto } from '../../photos/photoStore';
import { CitizenStatus } from '../../components/photos/CitizenStatus';
import { CitizenLayout } from './CitizenLayout';

/** The citizen's own complaints. Super Admin sees the demo citizen's list. */
export const useMyComplaints = (): GrievanceItem[] => {
  const { grievances } = useApp();
  const { currentUser } = useAuth();
  const citizenId = currentUser?.role === 'citizen' ? currentUser.id : 'USR-CITIZEN-01';
  return grievances.filter((g) => g.citizenId === citizenId);
};

export const EmptyState: React.FC<{ title: string; action?: string; onAction?: () => void }> = ({ title, action, onAction }) => (
  <div className="bg-white rounded-2xl border-2 border-dashed border-slate-300 p-8 text-center">
    <svg viewBox="0 0 120 90" className="w-32 h-24 mx-auto" aria-hidden="true">
      <rect x="20" y="12" width="80" height="66" rx="10" fill="#E2E8F0" />
      <rect x="32" y="26" width="56" height="8" rx="4" fill="#94A3B8" />
      <rect x="32" y="42" width="40" height="8" rx="4" fill="#CBD5E1" />
      <rect x="32" y="58" width="48" height="8" rx="4" fill="#CBD5E1" />
      <circle cx="94" cy="70" r="14" fill="#2E7D32" />
      <path d="M88 70h12M94 64v12" stroke="#fff" strokeWidth="4" strokeLinecap="round" />
    </svg>
    <p className="mt-3 text-lg font-bold">{title}</p>
    {action && onAction && (
      <button type="button" onClick={onAction} className="mt-4 min-h-[52px] px-6 rounded-xl bg-kmc-navy text-white text-base font-bold">
        {action}
      </button>
    )}
  </div>
);

export const TrackComplaints: React.FC = () => {
  const navigate = useNavigate();
  const { t } = usePrefs();
  const { currentUser } = useAuth();
  const { grievances } = useApp();
  const mine = useMyComplaints();
  const [query, setQuery] = useState('');
  const [notFound, setNotFound] = useState(false);

  const find = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim().toUpperCase().replace(/^GRV/, '#GRV');
    const pool = currentUser?.role === 'super_admin' ? grievances : mine;
    const match = pool.find((g) => g.id.toUpperCase() === q || g.id.toUpperCase() === `#${q}`);
    if (match) navigate(`/citizen/track/${encodeURIComponent(match.id)}`);
    else setNotFound(true);
  };

  return (
    <CitizenLayout title={t('track.title')}>
      <form onSubmit={find} className="bg-white rounded-2xl border-2 border-slate-200 p-4">
        <label htmlFor="track-id" className="text-base font-semibold">{t('track.searchLabel')}</label>
        <div className="mt-2 flex gap-2">
          <input
            id="track-id"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setNotFound(false);
            }}
            placeholder={t('track.searchPlaceholder')}
            className="flex-1 min-w-0 min-h-[52px] rounded-xl border-2 border-slate-300 px-3 text-base font-mono"
          />
          <button type="submit" className="min-h-[52px] px-4 rounded-xl bg-kmc-navy text-white text-base font-bold flex items-center gap-2">
            <Search className="w-5 h-5" aria-hidden="true" />
            {t('track.search')}
          </button>
        </div>
        {notFound && (
          <p role="alert" className="mt-3 flex items-start gap-2 text-base text-rose-900">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" aria-hidden="true" />
            {t('track.notFound')}
          </p>
        )}
      </form>

      <div className="mt-5 space-y-3">
        {mine.length === 0 ? (
          <EmptyState title={t('track.empty')} action={t('home.report')} onAction={() => navigate('/citizen/report')} />
        ) : (
          mine.map((g) => {
            const photo = getBeforePhotos(g)[0];
            const cat = categoryFor(g.category);
            return (
              <button
                key={g.id}
                type="button"
                onClick={() => navigate(`/citizen/track/${encodeURIComponent(g.id)}`)}
                className="w-full text-left bg-white rounded-2xl border-2 border-slate-200 hover:border-kmc-navy p-3 flex items-center gap-3"
              >
                <span className="w-20 h-20 rounded-xl overflow-hidden bg-slate-950 shrink-0 flex items-center justify-center border border-slate-200">
                  {photo ? (
                    <img src={resolvePhoto(photo.src)} alt={t('detail.beforeAlt', { problem: t(`report.cat.${cat.key}`) })} loading="lazy" className="w-full h-full object-contain" />
                  ) : (
                    <ImageOff className="w-7 h-7 text-slate-500" aria-hidden="true" />
                  )}
                </span>
                <span className="flex-1 min-w-0 space-y-1">
                  <span className="block text-lg font-bold">{t(`report.cat.${cat.key}`)}</span>
                  <span className="block text-sm font-mono text-slate-600">{g.id}</span>
                  <span className="block text-sm text-slate-600 truncate">{t('track.reported', { date: g.reportedOn })}</span>
                  <CitizenStatus status={g.status} />
                </span>
                <ChevronRight className="w-6 h-6 text-slate-500 shrink-0" aria-hidden="true" />
              </button>
            );
          })
        )}
      </div>

    </CitizenLayout>
  );
};
