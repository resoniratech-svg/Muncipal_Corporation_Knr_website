import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Home } from 'lucide-react';
import { usePrefs } from '../../i18n';

interface CitizenLayoutProps {
  title: string;
  /** Home screen has no back button */
  isHome?: boolean;
  children: React.ReactNode;
}

/** Citizen screens: always a Back button and a visible Home icon, large text, one column. */
export const CitizenLayout: React.FC<CitizenLayoutProps> = ({ title, isHome, children }) => {
  const navigate = useNavigate();
  const { t } = usePrefs();

  return (
    <div className="citizen-screen min-h-screen bg-kmc-bg text-slate-900 pb-28">
      <div className="bg-white border-b-2 border-slate-200">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
          {!isHome && (
            <button
              type="button"
              onClick={() => (window.history.length > 1 ? navigate(-1) : navigate('/citizen'))}
              className="min-h-[48px] px-3 rounded-xl border-2 border-slate-300 text-base font-semibold flex items-center gap-2 hover:bg-slate-50"
            >
              <ArrowLeft className="w-5 h-5" aria-hidden="true" />
              {t('common.back')}
            </button>
          )}
          <h1 className="flex-1 min-w-0 text-xl sm:text-2xl font-bold font-body tracking-normal truncate">{title}</h1>
          <button
            type="button"
            onClick={() => navigate('/citizen')}
            aria-label={t('common.home')}
            title={t('common.home')}
            className="w-12 h-12 rounded-xl bg-kmc-navy text-white flex items-center justify-center hover:bg-kmc-navy-light shrink-0"
          >
            <Home className="w-6 h-6" aria-hidden="true" />
          </button>
        </div>
      </div>
      <main className="max-w-3xl mx-auto px-4 py-6">{children}</main>
    </div>
  );
};
