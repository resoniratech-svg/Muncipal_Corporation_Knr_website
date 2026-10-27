import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { isQaInspectionActive, exitQaInspection, getQaRouteLabel } from '../../auth/qaInspection';
import { ShieldCheck, ArrowLeft, XCircle, AlertCircle } from 'lucide-react';
import { usePrefs } from '../../i18n';

export const QaInspectionBanner: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { t } = usePrefs();

  // If on /qa, automatically reset inspection mode
  useEffect(() => {
    if (location.pathname === '/qa') {
      exitQaInspection();
    }
  }, [location.pathname]);

  // Don't show banner on login, access-denied, or QA checklist itself
  if (
    location.pathname === '/qa' ||
    location.pathname === '/login' ||
    location.pathname === '/access-denied'
  ) {
    return null;
  }

  const active = isQaInspectionActive(currentUser, location);
  if (!active) {
    return null;
  }

  const screenLabel = getQaRouteLabel(location.pathname);

  const handleReturn = () => {
    exitQaInspection();
    navigate('/qa');
  };

  const handleExit = () => {
    exitQaInspection();
    navigate(currentUser?.role === 'governance_auditor' ? '/monitoring' : '/');
  };

  return (
    <aside
      aria-label="QA Inspection Mode Banner"
      className="sticky top-0 z-50 bg-slate-900 text-white border-b-2 border-amber-400 shadow-lg px-3 py-2 sm:px-4 sm:py-2.5"
    >
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-2.5">
        {/* Left: Indicator info */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-400/20 text-amber-300 border border-amber-400/50 text-xs font-bold font-mono tracking-wider uppercase">
            <ShieldCheck className="w-4 h-4 text-amber-400" aria-hidden="true" />
            <span>{t("QA Inspection Mode")}</span>
          </div>

          <div className="text-xs text-slate-300 flex items-center gap-1.5 flex-wrap">
            <span className="font-semibold text-white">
              {t("Auditor")}: {currentUser?.displayName || 'Dr. T. Radhakrishnan'}
            </span>
            <span className="text-slate-500">•</span>
            <span className="text-slate-200">
              {t("Inspecting")}: <strong className="text-amber-200">{t(screenLabel)}</strong>
              <code className="ml-1 px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono text-[11px]">
                {location.pathname}
              </code>
            </span>
          </div>

          <div className="hidden lg:flex items-center gap-1 text-[11px] text-amber-300/90 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700">
            <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" aria-hidden="true" />
            <span>{t("Read-Only Audit: Form mutations and record creation are disabled")}</span>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 shrink-0 self-end md:self-auto">
          <button
            type="button"
            onClick={handleReturn}
            className="px-3.5 py-1.5 min-h-[36px] bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs uppercase rounded-lg shadow transition flex items-center gap-1.5 active:scale-95"
          >
            <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
            <span>{t("Return to QA Checklist")}</span>
          </button>

          <button
            type="button"
            onClick={handleExit}
            title={t("Exit inspection and return to auditor portal")}
            className="px-2.5 py-1.5 min-h-[36px] bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-semibold text-xs rounded-lg border border-slate-700 transition flex items-center gap-1"
          >
            <XCircle className="w-3.5 h-3.5" aria-hidden="true" />
            <span className="hidden sm:inline">{t("Exit Inspection")}</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
