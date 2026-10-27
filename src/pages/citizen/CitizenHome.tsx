import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Megaphone, Search, MapPinned, Bell, Images, ChevronRight, ShieldCheck, ExternalLink } from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';
import { usePrefs } from '../../i18n';
import { CitizenLayout } from './CitizenLayout';
import { isQaInspectionActive } from '../../auth/qaInspection';

/** Citizen home: exactly four big buttons; everything else is one level deeper. */
export const CitizenHome: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useAuth();
  const { t } = usePrefs();
  const name = currentUser?.role === 'citizen' ? currentUser.displayName : 'Sri. P. Rajesh Kumar';
  const isQaAuditor = currentUser?.role === 'governance_auditor' || isQaInspectionActive(currentUser, location);

  const actions = [
    { to: '/citizen/report', icon: Megaphone, label: t('home.report'), hint: t('home.reportHint'), tour: 'report', primary: true },
    { to: '/citizen/track', icon: Search, label: t('home.track'), hint: t('home.trackHint'), tour: 'track' },
    { to: '/citizen/ward', icon: MapPinned, label: t('home.ward'), hint: t('home.wardHint') },
    { to: '/citizen/notices', icon: Bell, label: t('home.notices'), hint: t('home.noticesHint') },
  ];

  return (
    <CitizenLayout title={t('home.hello', { name })} isHome>
      {/* Auditor QA Inspection Direct Shortcut */}
      {isQaAuditor && (
        <div className="mb-5 p-4 rounded-2xl bg-amber-500 text-slate-950 border-2 border-amber-600 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-[10px] font-mono font-bold uppercase bg-slate-950 text-amber-300 px-2 py-0.5 rounded inline-flex items-center gap-1 mb-1">
              <ShieldCheck className="w-3 h-3 text-amber-400" />
              {t("Auditor QA Navigation")}
            </span>
            <p className="text-xs font-bold text-slate-950">
              {t("You are inspecting the Citizen Home. To review the resolved grievance (#GRV-2024-27-0045) audit details:")}
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/qa/grievances/GRV-2024-27-0045?qaInspect=true')}
            className="px-4 py-2 bg-slate-950 hover:bg-slate-900 text-amber-300 text-xs font-bold rounded-xl uppercase shadow transition flex items-center justify-center gap-1.5 shrink-0"
          >
            <span>{t("Inspect Grievance Audit")}</span>
            <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
          </button>
        </div>
      )}

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
