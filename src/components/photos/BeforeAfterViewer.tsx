import React, { useState } from 'react';
import { MapPin, CalendarClock, ImageOff, Maximize2 } from 'lucide-react';
import { PhotoEvidence, resolvePhoto } from '../../photos/photoStore';
import { usePrefs } from '../../i18n';
import { PhotoLightbox } from './PhotoLightbox';

interface BeforeAfterViewerProps {
  before: PhotoEvidence[];
  after: PhotoEvidence[];
  /** Short problem name used in alt text, e.g. "drain overflow" */
  problem: string;
  /** Staff screens keep English labels */
  english?: boolean;
  compact?: boolean;
}

/**
 * Before / After evidence: side by side on desktop, stacked on mobile, with a
 * "Slide to compare" control when both photos exist. Tapping a photo opens it full screen.
 */
export const BeforeAfterViewer: React.FC<BeforeAfterViewerProps> = ({ before, after, problem, english, compact }) => {
  const prefs = usePrefs();
  const t = (english && prefs.lang === 'en') ? prefs.tEn : prefs.t;
  const [split, setSplit] = useState(50);
  const [beforeIdx, setBeforeIdx] = useState(0);
  const [afterIdx, setAfterIdx] = useState(0);
  const [open, setOpen] = useState<{ photo: PhotoEvidence; label: string; alt: string } | null>(null);

  const b = before[beforeIdx] || before[0];
  const a = after[afterIdx] || after[0];
  const beforeAlt = t('detail.beforeAlt', { problem });
  const afterAlt = t('detail.afterAlt', { problem });

  const panel = (photo: PhotoEvidence | undefined, list: PhotoEvidence[], idx: number, setIdx: (i: number) => void, kind: 'before' | 'after') => {
    const label = t(kind === 'before' ? 'detail.before' : 'detail.after');
    const alt = kind === 'before' ? beforeAlt : afterAlt;
    return (
      <figure className="rounded-xl border-2 border-slate-200 overflow-hidden bg-white flex flex-col justify-between">
        <div className="relative w-full h-64 sm:h-72 md:h-80 bg-slate-950 flex items-center justify-center overflow-hidden">
          {photo ? (
            <button
              type="button"
              onClick={() => setOpen({ photo, label, alt })}
              className="block w-full h-full group focus:outline-none focus:ring-2 focus:ring-kmc-navy"
              aria-label={`${t('detail.openPhoto')}: ${alt}`}
            >
              <img
                src={resolvePhoto(photo.src)}
                alt={alt}
                loading="lazy"
                className="w-full h-full object-contain group-hover:scale-[1.02] transition-transform select-none"
              />
              <span className="absolute bottom-2.5 right-2.5 w-9 h-9 rounded-full bg-slate-950/80 text-white flex items-center justify-center group-hover:bg-slate-900 shadow">
                <Maximize2 className="w-4 h-4" aria-hidden="true" />
              </span>
            </button>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 text-sm text-center px-4 gap-2">
              <ImageOff className="w-8 h-8 text-slate-500" aria-hidden="true" />
              {t(kind === 'before' ? 'detail.noBefore' : 'detail.noAfterYet')}
            </div>
          )}
          <span className={`absolute top-2.5 left-2.5 px-3 py-1 rounded-full text-xs font-bold text-white shadow ${kind === 'before' ? 'bg-orange-700' : 'bg-emerald-700'}`}>
            {label}
          </span>
        </div>
        {photo && (
          <figcaption className="px-3.5 py-2.5 text-xs sm:text-sm text-slate-700 space-y-1 bg-slate-50 border-t border-slate-100">
            <span className="flex items-center gap-1.5 font-medium"><CalendarClock className="w-4 h-4 text-slate-500 shrink-0" aria-hidden="true" />{photo.takenAt}</span>
            <span className="flex items-center gap-1.5 text-slate-600"><MapPin className="w-4 h-4 text-red-500 shrink-0" aria-hidden="true" />{photo.location} · {photo.lat.toFixed(4)}, {photo.lng.toFixed(4)}</span>
          </figcaption>
        )}
        {list.length > 1 && (
          <div className="flex gap-2 px-3 pb-3 pt-1">
            {list.map((p, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setIdx(i)}
                aria-label={`${label} ${i + 1}`}
                aria-pressed={i === idx}
                className={`w-14 h-14 rounded-lg overflow-hidden border-2 bg-slate-950 flex items-center justify-center ${i === idx ? 'border-kmc-navy ring-1 ring-kmc-navy' : 'border-slate-300'}`}
              >
                <img src={resolvePhoto(p.src)} alt="" loading="lazy" className="w-full h-full object-contain" />
              </button>
            ))}
          </div>
        )}
      </figure>
    );
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {panel(b, before, beforeIdx, setBeforeIdx, 'before')}
        {panel(a, after, afterIdx, setAfterIdx, 'after')}
      </div>

      {b && a && (
        <div className="rounded-xl border-2 border-slate-200 bg-white p-3.5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm sm:text-base font-semibold text-slate-800">{t('detail.slide')}</p>
            <span className="text-xs text-slate-500 font-mono">
              {split < 50 ? t('detail.after') : t('detail.before')} ({split}%)
            </span>
          </div>
          <div className="relative w-full h-72 sm:h-80 md:h-96 rounded-xl overflow-hidden select-none bg-slate-950 flex items-center justify-center">
            <img src={resolvePhoto(a.src)} alt={afterAlt} className="absolute inset-0 w-full h-full object-contain pointer-events-none" />
            <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ clipPath: `inset(0 ${100 - split}% 0 0)` }}>
              <img src={resolvePhoto(b.src)} alt={beforeAlt} className="absolute inset-0 w-full h-full object-contain" />
            </div>
            <div className="absolute top-0 bottom-0 w-1 bg-white shadow-[0_0_0_2px_rgba(0,0,0,0.4)] pointer-events-none" style={{ left: `calc(${split}% - 2px)` }} />
            <span className="absolute top-2.5 left-2.5 px-3 py-1 rounded-full text-xs font-bold text-white bg-orange-700 shadow">{t('detail.before')}</span>
            <span className="absolute top-2.5 right-2.5 px-3 py-1 rounded-full text-xs font-bold text-white bg-emerald-700 shadow">{t('detail.after')}</span>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            value={split}
            onChange={(e) => setSplit(Number(e.target.value))}
            aria-label={t('detail.slide')}
            className="w-full mt-3 h-11 accent-kmc-navy cursor-pointer"
          />
        </div>
      )}

      {(b || a) && <p className="text-xs sm:text-sm text-slate-600 italic">{t('Tap a photo to see it full screen.')}</p>}

      {open && <PhotoLightbox photo={open.photo} label={open.label} alt={open.alt} closeLabel={t('common.close')} onClose={() => setOpen(null)} />}
    </div>
  );
};
