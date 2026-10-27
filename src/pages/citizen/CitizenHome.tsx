import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Megaphone, Search, MapPinned, Bell, Images, ChevronRight } from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';
import { usePrefs } from '../../i18n';
import { CitizenLayout } from './CitizenLayout';

/** Citizen home: exactly four big buttons; everything else is one level deeper. */
export const CitizenHome: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { t } = usePrefs();
  const name = currentUser?.role === 'citizen' ? currentUser.displayName : 'Sri. P. Rajesh Kumar';

  const actions = [
    { to: '/citizen/report', icon: Megaphone, label: t('home.report'), hint: t('home.reportHint'), tour: 'report', primary: true },
    { to: '/citizen/track', icon: Search, label: t('home.track'), hint: t('home.trackHint'), tour: 'track' },
    { to: '/citizen/ward', icon: MapPinned, label: t('home.ward'), hint: t('home.wardHint') },
    { to: '/citizen/notices', icon: Bell, label: t('home.notices'), hint: t('home.noticesHint') },
  ];

  return (
    <CitizenLayout title={t('home.hello', { name })} isHome>
      <p className="text-lg text-slate-700">{t('home.question')}</p>
      <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {actions.map(({ to, icon: Icon, label, hint, tour, primary }) => (
          <button
            key={to}
            type="button"
            data-tour={tour}
            onClick={() => navigate(to)}
            className={`text-left min-h-[132px] rounded-2xl p-5 flex flex-col justify-between gap-3 shadow-card border-2 transition-colors ${
              primary ? 'bg-kmc-navy text-white border-kmc-navy hover:bg-kmc-navy-light' : 'bg-white text-slate-900 border-slate-200 hover:border-kmc-navy'
            }`}
          >
            <span className={`w-14 h-14 rounded-2xl flex items-center justify-center ${primary ? 'bg-white/15' : 'bg-blue-50 text-kmc-navy'}`}>
              <Icon className="w-8 h-8" aria-hidden="true" />
            </span>
            <span>
              <span className="block text-xl font-bold">{label}</span>
              <span className={`block text-base mt-0.5 ${primary ? 'text-slate-200' : 'text-slate-600'}`}>{hint}</span>
            </span>
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={() => navigate('/citizen/gallery')}
        className="mt-6 w-full min-h-[56px] rounded-xl border-2 border-slate-300 bg-white px-4 flex items-center gap-3 text-base font-semibold hover:border-kmc-navy"
      >
        <Images className="w-6 h-6 text-kmc-green" aria-hidden="true" />
        <span className="flex-1 text-left">{t('home.gallery')}</span>
        <ChevronRight className="w-5 h-5 text-slate-500" aria-hidden="true" />
      </button>
    </CitizenLayout>
  );
};
