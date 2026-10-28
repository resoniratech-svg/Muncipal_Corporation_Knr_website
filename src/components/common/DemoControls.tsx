import React, { useEffect, useRef, useState } from 'react';
import { FlaskConical, PlayCircle, RotateCcw, Compass, ChevronDown } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../auth/AuthContext';
import { usePrefs, LANGUAGES, FontScale } from '../../i18n';
import { useToast } from '../../ui/Toast';
import { useTour } from '../../ui/Tour';
import { useQuickDemo } from '../../ui/QuickDemo';
import { storedPhotoBytes } from '../../photos/photoStore';

/** English | తెలుగు | हिन्दी toggle (citizen screens) */
export const LanguageToggle: React.FC<{ glass?: boolean; className?: string }> = ({ glass, className = '' }) => {
  const { lang, setLang, t } = usePrefs();
  const baseBg = glass ? 'bg-transparent' : 'bg-slate-800 border border-slate-700';
  return (
    <div role="group" aria-label={t('common.language')} className={`flex items-center rounded-lg p-0.5 ${baseBg} ${className}`}>
      {LANGUAGES.map((l) => (
        <button
          key={l.code}
          type="button"
          lang={l.code}
          aria-pressed={lang === l.code}
          onClick={() => setLang(l.code)}
          className={`min-h-[36px] px-2.5 rounded-md text-xs font-bold transition-all ${
            lang === l.code
              ? 'bg-white text-slate-950 shadow-sm'
              : glass
              ? 'text-slate-200 hover:text-white hover:bg-white/10'
              : 'text-slate-300 hover:text-white'
          }`}
        >
          {l.label}
        </button>
      ))}
    </div>
  );
};

/** A- / A / A+ font size toggle */
export const FontSizeToggle: React.FC = () => {
  const { fontScale, setFontScale, t } = usePrefs();
  const options: { scale: FontScale; label: string; aria: string }[] = [
    { scale: 'sm', label: 'A-', aria: t('common.smaller') },
    { scale: 'md', label: 'A', aria: t('common.normal') },
    { scale: 'lg', label: 'A+', aria: t('common.larger') },
  ];
  return (
    <div role="group" aria-label={t('common.textSize')} className="flex items-center rounded-lg bg-slate-800 border border-slate-700 p-0.5">
      {options.map((o) => (
        <button
          key={o.scale}
          type="button"
          aria-label={o.aria}
          aria-pressed={fontScale === o.scale}
          onClick={() => setFontScale(o.scale)}
          className={`min-h-[36px] min-w-[36px] px-1.5 rounded-md text-xs font-bold ${fontScale === o.scale ? 'bg-white text-slate-950' : 'text-slate-300 hover:text-white'}`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
};

/** Small Demo menu: Quick Demo (60-second story), Reset Demo, and the guided tour. */
export const DemoMenu: React.FC = () => {
  const { resetAllDemoData } = useApp();
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const { startTour } = useTour();
  const { t } = usePrefs();
  const quickDemo = useQuickDemo();
  const [open, setOpen] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const canRunStory = currentUser?.role === 'super_admin';

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onDown);
    window.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const usedKb = Math.round(storedPhotoBytes() / 1024);

  return (
    <div ref={ref} className="relative" data-tour="demo-menu">
      <button
        type="button"
        onClick={() => {
          setOpen((v) => !v);
          setConfirming(false);
        }}
        aria-expanded={open}
        aria-haspopup="menu"
        className="min-h-[36px] px-2.5 rounded-lg bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-1"
      >
        <FlaskConical className="w-4 h-4" aria-hidden="true" />
        {t('Demo')}
        <ChevronDown className="w-3.5 h-3.5" aria-hidden="true" />
      </button>
      {open && (
        <div role="menu" className="absolute right-0 mt-2 w-72 bg-white text-slate-900 rounded-xl shadow-2xl border border-slate-200 p-2 z-50">
          <button
            type="button"
            role="menuitem"
            disabled={!canRunStory}
            onClick={() => {
              setOpen(false);
              quickDemo.start();
            }}
            className="w-full min-h-[48px] px-3 rounded-lg text-left text-sm font-semibold flex items-center gap-2 hover:bg-slate-100 disabled:opacity-50"
          >
            <PlayCircle className="w-5 h-5 text-kmc-green" aria-hidden="true" />
            <span>
              {t('Quick Demo (60 seconds)')}
              <span className="block text-xs font-normal text-slate-500">
                {canRunStory ? t('Report → route → after photo → approve → rate') : t('Sign in as Super Admin to run it')}
              </span>
            </span>
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              startTour();
            }}
            className="w-full min-h-[48px] px-3 rounded-lg text-left text-sm font-semibold flex items-center gap-2 hover:bg-slate-100"
          >
            <Compass className="w-5 h-5 text-kmc-navy" aria-hidden="true" />
            {t('Take the guided tour')}
          </button>
          <div className="border-t border-slate-100 my-1" />
          {confirming ? (
            <div className="p-2 space-y-2">
              <p className="text-sm">{t('Reset Demo removes every complaint and photo added in this browser and restores the 12 demo complaints.')}</p>
              <div className="grid grid-cols-2 gap-2">
                <button type="button" onClick={() => setConfirming(false)} className="min-h-[44px] rounded-lg border-2 border-slate-300 text-sm font-semibold">{t('Cancel')}</button>
                <button
                  type="button"
                  data-testid="confirm-reset"
                  onClick={() => {
                    quickDemo.stop();
                    resetAllDemoData();
                    setOpen(false);
                    setConfirming(false);
                    toast(t('Demo reset. All added complaints and photos were removed.'));
                  }}
                  className="min-h-[44px] rounded-lg bg-rose-700 text-white text-sm font-bold"
                >
                  {t('Yes, reset')}
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              role="menuitem"
              onClick={() => setConfirming(true)}
              className="w-full min-h-[48px] px-3 rounded-lg text-left text-sm font-semibold flex items-center gap-2 hover:bg-rose-50 text-rose-800"
            >
              <RotateCcw className="w-5 h-5" aria-hidden="true" />
              <span>
                {t('Reset Demo')}
                <span className="block text-xs font-normal text-slate-500">{t('Uploaded photos use about {{kb}} KB', { kb: usedKb })}</span>
              </span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};
