import React from 'react';
import kmcLogo from '../assets/kmc-logo.svg';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { ROLE_DESTINATIONS, ROLE_DISPLAY_NAMES } from '../auth/permissions';
import { ShieldAlert, ArrowLeft, LogOut, Home } from 'lucide-react';
import { usePrefs } from '../i18n';

export const AccessDeniedPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, logout, activeRole } = useAuth();
  const { t } = usePrefs();

  const state = (location.state as any) || {};
  const attemptedPath = state.attemptedPath || 'Restricted Screen';
  const requiredRoles = state.requiredRoles as string[] | undefined;

  const currentBadge = currentUser ? ROLE_DISPLAY_NAMES[currentUser.role] : null;
  const userHomeRoute = currentUser ? ROLE_DESTINATIONS[currentUser.role] : '/login';

  return (
    <div className="min-h-screen bg-kmc-bg flex flex-col justify-between selection:bg-kmc-navy selection:text-white">
      <div className="bg-kmc-navy text-white px-4 py-2 text-xs flex items-center justify-between border-b-2 border-kmc-green-accent">
        <div className="flex items-center gap-2">
          <img src={kmcLogo} alt="KMC" className="w-5 h-5 object-contain" />
          <span className="font-heading uppercase tracking-wider text-amber-300 font-bold">
            {t("Karimnagar Municipal Corporation Security Shield")}
          </span>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-lg w-full p-6 sm:p-8 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-700 mx-auto flex items-center justify-center border-2 border-rose-300 shadow">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <h2 className="text-xl sm:text-2xl font-bold font-heading uppercase text-slate-900">
            {t("Access Restricted (403 Forbidden)")}
          </h2>

          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            {t("Your authenticated account does not possess the administrative privileges required to access")}{' '}
            <code className="px-1.5 py-0.5 rounded bg-slate-100 text-rose-700 font-mono font-bold text-xs">
              {attemptedPath}
            </code>.
          </p>

          {/* Role status box */}
          {currentUser && currentBadge && (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-left space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">{t("Your Current Account:")}</span>
                <span className="font-bold text-slate-900">{currentUser.displayName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">{t("Assigned Role:")}</span>
                <span className={`px-2 py-0.5 rounded text-[11px] font-bold border ${currentBadge.bg} ${currentBadge.color}`}>
                  {t(currentBadge.title)}
                </span>
              </div>
              {requiredRoles && requiredRoles.length > 0 && (
                <div className="flex justify-between items-center pt-1 border-t border-slate-200 text-rose-700">
                  <span className="font-medium">{t("Required Role:")}</span>
                  <span className="font-bold uppercase text-[11px]">{requiredRoles.map(r => t(r)).join(' or ')}</span>
                </div>
              )}
            </div>
          )}

          <div className="pt-3 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => navigate(userHomeRoute)}
              className="px-4 py-2 min-h-[40px] bg-kmc-navy hover:bg-kmc-navy-light text-white font-bold text-xs uppercase rounded-xl shadow flex items-center gap-1.5"
            >
              <Home className="w-4 h-4" />
              <span>{t("Return to Authorized Portal")}</span>
            </button>

            <button
              onClick={() => {
                logout();
                navigate('/login');
              }}
              className="px-4 py-2 min-h-[40px] bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs uppercase rounded-xl flex items-center gap-1.5"
            >
              <LogOut className="w-4 h-4" />
              <span>{t("Switch Account / Sign In as Different Role")}</span>
            </button>
          </div>
        </div>
      </div>

      <footer className="bg-slate-900 text-slate-400 text-xs py-3 px-4 text-center border-t border-slate-800">
        {t("Role-Based Access Control Active • KMC Digital Governance Security Policy")}
      </footer>
    </div>
  );
};
