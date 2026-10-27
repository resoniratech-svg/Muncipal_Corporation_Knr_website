import React, { useEffect, useRef, useState } from 'react';
import { HelpCircle, X, Send, Search, Star } from 'lucide-react';
import { usePrefs } from '../i18n';

const STEPS = [
  { icon: Send, title: 'helpGuide.s1Title', text: 'helpGuide.s1Text' },
  { icon: Search, title: 'helpGuide.s2Title', text: 'helpGuide.s2Text' },
  { icon: Star, title: 'helpGuide.s3Title', text: 'helpGuide.s3Text' },
];

/** Persistent Help button (every screen) that opens a simple 3-step guide. */
export const HelpGuide: React.FC = () => {
  const { t } = usePrefs();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    dialogRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const current = STEPS[step];
  const Icon = current.icon;

  return (
    <>
      <button
        type="button"
        data-tour="help"
        onClick={() => {
          setStep(0);
          setOpen(true);
        }}
        className="fixed bottom-5 right-5 z-[60] min-h-[48px] pl-4 pr-5 rounded-full bg-kmc-green text-white text-base font-bold shadow-2xl flex items-center gap-2 hover:bg-emerald-800"
        aria-haspopup="dialog"
      >
        <HelpCircle className="w-5 h-5" aria-hidden="true" />
        {t('common.help')}
      </button>

      {open && (
        <div className="fixed inset-0 z-[80] bg-slate-950/60 flex items-end sm:items-center justify-center p-4" onClick={() => setOpen(false)}>
          <div
            ref={dialogRef}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-labelledby="help-title"
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-white text-slate-900 rounded-2xl shadow-2xl p-6 outline-none"
          >
            <div className="flex items-center justify-between gap-3">
              <h2 id="help-title" className="text-xl font-bold">{t('helpGuide.title')}</h2>
              <button type="button" onClick={() => setOpen(false)} aria-label={t('common.close')} className="w-11 h-11 rounded-full hover:bg-slate-100 flex items-center justify-center">
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>

            <div className="mt-5 flex items-start gap-4" aria-live="polite">
              <span className="w-14 h-14 rounded-2xl bg-emerald-50 text-kmc-green flex items-center justify-center shrink-0">
                <Icon className="w-7 h-7" aria-hidden="true" />
              </span>
              <div>
                <p className="text-sm font-semibold text-slate-500">{t('helpGuide.stepCount', { n: step + 1 })}</p>
                <h3 className="text-lg font-bold mt-0.5">{t(current.title)}</h3>
                <p className="text-base text-slate-700 mt-1 leading-relaxed">{t(current.text)}</p>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setStep((s) => s - 1)}
                disabled={step === 0}
                className="flex-1 min-h-[48px] rounded-xl border-2 border-slate-300 text-base font-semibold disabled:opacity-40"
              >
                {t('helpGuide.prev')}
              </button>
              <button
                type="button"
                onClick={() => (step < STEPS.length - 1 ? setStep((s) => s + 1) : setOpen(false))}
                className="flex-1 min-h-[48px] rounded-xl bg-kmc-navy text-white text-base font-bold"
              >
                {step < STEPS.length - 1 ? t('common.next') : t('helpGuide.done')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
