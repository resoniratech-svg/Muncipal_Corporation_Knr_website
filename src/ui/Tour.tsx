import React, { createContext, useCallback, useContext, useEffect, useLayoutEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { ROLE_DESTINATIONS } from '../auth/permissions';
import { UserRole } from '../auth/authTypes';
import { usePrefs } from '../i18n';

interface TourStep {
  /** CSS selector of the element to highlight; centred card when absent or not on screen */
  target?: string;
  title: string;
  text: string;
}

// Citizen steps are translated; staff/leadership steps keep the deck's English labels.
const ROLE_TOURS: Partial<Record<UserRole, (t: (k: string) => string) => TourStep[]>> = {
  citizen: (t) => [
    { title: t('tour.citizen1Title'), text: t('tour.citizen1Text') },
    { target: '[data-tour="report"]', title: t('tour.citizen2Title'), text: t('tour.citizen2Text') },
    { target: '[data-tour="track"]', title: t('tour.citizen3Title'), text: t('tour.citizen3Text') },
    { target: '[data-tour="help"]', title: t('tour.citizen4Title'), text: t('tour.citizen4Text') },
  ],
  corporator: () => [
    { title: 'Your ward at a glance', text: 'This page shows every complaint, task and work in your ward.' },
    { target: '[data-tour="new-complaints"]', title: 'New complaints', text: 'Check each new complaint and send it to field staff with one tap.' },
    { target: '[data-tour="verify"]', title: 'Check the work', text: 'Compare the before and after photos. Tap Approve & Close, or Send Back with a reason.' },
    { target: '[data-tour="help"]', title: 'Need help?', text: 'Tap Help at any time.' },
  ],
  field_staff: () => [
    { title: 'Your tasks', text: 'Every task given to you is listed here, with the citizen’s before photo.' },
    { target: '[data-tour="task"]', title: 'One task', text: 'Start the work, then come back when it is done.' },
    { target: '[data-tour="done-btn"]', title: 'Mark as Done & Upload Photo', text: 'Take the after photo from the same spot as the before photo. A task cannot be closed without it.' },
    { target: '[data-tour="help"]', title: 'Need help?', text: 'Tap Help at any time.' },
  ],
  mayor_commissioner: () => [
    { title: 'Leadership Dashboard', text: 'City-wide numbers first, details below.' },
    { target: '[data-tour="kpis"]', title: 'Top KPIs', text: 'Complaints, progress and resolution rate for all 66 wards.' },
    { target: '[data-tour="complaints"]', title: 'Recent complaints', text: 'Tap any complaint to see its before and after photos.' },
    { target: '[data-tour="reopened"]', title: 'Reopened complaints', text: 'Complaints that citizens say are not solved appear here, escalated one level.' },
    { target: '[data-tour="help"]', title: 'Need help?', text: 'Tap Help at any time.' },
  ],
  super_admin: () => [
    { title: 'Platform overview', text: 'Pick a role to see the platform the way that person does.' },
    { target: '[data-tour="roles"]', title: 'Three roles', text: 'Citizen, Ward Councillor / Field Staff, and Mayor / Commissioner.' },
    { target: '[data-tour="demo-menu"]', title: 'Demo menu', text: 'Run the Quick Demo for officials, or reset all demo data.' },
    { target: '[data-tour="help"]', title: 'Need help?', text: 'Tap Help at any time.' },
  ],
  department_officer: () => [
    { title: 'Department console', text: 'Complaints for your department, with SLA timers.' },
    { target: '[data-tour="nav"]', title: 'Navigation', text: 'Your pages are in this bar.' },
    { target: '[data-tour="demo-menu"]', title: 'Demo menu', text: 'Reset or replay the demo from here.' },
    { target: '[data-tour="help"]', title: 'Need help?', text: 'Tap Help at any time.' },
  ],
  governance_auditor: () => [
    { title: 'Monitoring', text: 'Reports, rankings and the audit trail.' },
    { target: '[data-tour="nav"]', title: 'Navigation', text: 'Your pages are in this bar.' },
    { target: '[data-tour="demo-menu"]', title: 'Demo menu', text: 'Reset or replay the demo from here.' },
    { target: '[data-tour="help"]', title: 'Need help?', text: 'Tap Help at any time.' },
  ],
};

const offKey = (role: string) => `kmc-ui:tour-off:${role}`;
const sessionKey = (role: string) => `kmc-ui:tour-seen:${role}`;

const storageGet = (store: () => Storage, key: string) => {
  try {
    return store().getItem(key);
  } catch {
    return null;
  }
};
const storageSet = (store: () => Storage, key: string) => {
  try {
    store().setItem(key, '1');
  } catch {
    // ignore
  }
};

interface TourContextType {
  startTour: () => void;
  suppress: (value: boolean) => void;
}
const TourContext = createContext<TourContextType>({ startTour: () => {}, suppress: () => {} });
export const useTour = () => useContext(TourContext);

/** Optional first-time coach marks per role (Skip / Don't show again). */
export const TourProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { activeRole } = useAuth();
  const { t } = usePrefs();
  const location = useLocation();
  const [steps, setSteps] = useState<TourStep[] | null>(null);
  const [index, setIndex] = useState(0);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const [suppressed, setSuppressed] = useState(false);

  const build = useCallback(() => (activeRole && ROLE_TOURS[activeRole] ? ROLE_TOURS[activeRole]!(t) : null), [activeRole, t]);

  const startTour = useCallback(() => {
    const s = build();
    if (s) {
      setIndex(0);
      setSteps(s);
    }
  }, [build]);

  // First visit to the role's landing page in this session, unless turned off
  useEffect(() => {
    if (!activeRole || suppressed || steps) return;
    if (location.pathname !== ROLE_DESTINATIONS[activeRole]) return;
    if (storageGet(() => window.localStorage, offKey(activeRole)) || storageGet(() => window.sessionStorage, sessionKey(activeRole))) return;
    storageSet(() => window.sessionStorage, sessionKey(activeRole));
    const timer = setTimeout(startTour, 700);
    return () => clearTimeout(timer);
  }, [activeRole, location.pathname, suppressed, steps, startTour]);

  // The tour belongs to the page it started on; leaving the page ends it
  const [tourPath, setTourPath] = useState<string | null>(null);
  useEffect(() => {
    if (steps) setTourPath((p) => p ?? location.pathname);
    else setTourPath(null);
  }, [steps, location.pathname]);
  useEffect(() => {
    if (steps && tourPath && location.pathname !== tourPath) setSteps(null);
  }, [location.pathname, steps, tourPath]);

  const step = steps?.[index];

  useLayoutEffect(() => {
    if (!step?.target) {
      setRect(null);
      return;
    }
    const el = document.querySelector(step.target) as HTMLElement | null;
    if (!el) {
      setRect(null);
      return;
    }
    el.scrollIntoView({ block: 'center', behavior: 'auto' });
    const update = () => setRect(el.getBoundingClientRect());
    update();
    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, true);
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update, true);
    };
  }, [step]);

  const close = (permanent: boolean) => {
    if (permanent && activeRole) storageSet(() => window.localStorage, offKey(activeRole));
    setSteps(null);
  };

  useEffect(() => {
    if (!steps) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setSteps(null);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [steps]);

  const cardTop = rect ? (rect.bottom + 220 < window.innerHeight ? rect.bottom + 12 : Math.max(12, rect.top - 232)) : undefined;

  return (
    <TourContext.Provider value={{ startTour, suppress: setSuppressed }}>
      {children}
      {steps && step && (
        <div className="fixed inset-0 z-[90]" role="dialog" aria-modal="true" aria-labelledby="tour-title">
          {rect ? (
            <div
              className="absolute rounded-xl ring-4 ring-amber-400 pointer-events-none"
              style={{ top: rect.top - 6, left: rect.left - 6, width: rect.width + 12, height: rect.height + 12, boxShadow: '0 0 0 9999px rgba(2,6,23,0.6)' }}
            />
          ) : (
            <div className="absolute inset-0 bg-slate-950/60" />
          )}
          <div
            className="absolute left-1/2 -translate-x-1/2 w-[min(92vw,24rem)] bg-white text-slate-900 rounded-2xl shadow-2xl p-5"
            style={cardTop !== undefined ? { top: cardTop } : { top: '50%', transform: 'translate(-50%, -50%)' }}
          >
            <p className="text-sm font-semibold text-slate-500">{t('tour.count', { n: index + 1, total: steps.length })}</p>
            <h2 id="tour-title" className="text-lg font-bold mt-1">{step.title}</h2>
            <p className="text-base text-slate-700 mt-1 leading-relaxed">{step.text}</p>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <button type="button" onClick={() => close(false)} className="min-h-[44px] px-3 rounded-lg text-base font-semibold text-slate-600 hover:bg-slate-100">
                {t('tour.skip')}
              </button>
              <button type="button" onClick={() => close(true)} className="min-h-[44px] px-3 rounded-lg text-base font-semibold text-slate-600 hover:bg-slate-100">
                {t('tour.dontShow')}
              </button>
              <button
                type="button"
                autoFocus
                onClick={() => (index < steps.length - 1 ? setIndex((i) => i + 1) : close(false))}
                className="ml-auto min-h-[48px] px-5 rounded-xl bg-kmc-navy text-white text-base font-bold"
              >
                {index < steps.length - 1 ? t('tour.next') : t('tour.done')}
              </button>
            </div>
          </div>
        </div>
      )}
    </TourContext.Provider>
  );
};
