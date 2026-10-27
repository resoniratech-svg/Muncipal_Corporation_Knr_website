import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { DECK_SLIDES } from '../../data/deckText';
import { usePrefs } from '../../i18n';

interface DeckSectionsProps {
  page: number;
  /** Indexes into the slide's `sections` array; renders all when omitted. */
  only?: number[];
  /** Card styling for live pages; false gives the lighter style used inside the presentation canvas. */
  framed?: boolean;
  /** Also renders the slide's printed figures (e.g. Page 13 grievance monitoring numbers). */
  withMetrics?: string;
}

// Renders the verbatim section blocks of a deck page (src/data/deckText.ts).
export const DeckSections: React.FC<DeckSectionsProps> = ({ page, only, framed = true, withMetrics }) => {
  const { t } = usePrefs();
  const slide = DECK_SLIDES.find((s) => s.page === page);
  if (!slide) return null;
  const allSections = slide.sections || [];
  const sections = only ? only.map((i) => allSections[i]).filter(Boolean) : allSections;

  return (
    <div className="space-y-4">
      {withMetrics && slide.metrics && (
        <section className="bg-white rounded-xl shadow-card border border-slate-200 p-5">
          <div className="flex items-center justify-between gap-2 pb-2.5 mb-3 border-b border-slate-100">
            <h3 className="text-xs sm:text-sm font-bold font-heading uppercase text-slate-800">{t(withMetrics)}</h3>
            <span className="text-[11px] font-bold uppercase tracking-wider text-kmc-navy bg-blue-50 px-2 py-0.5 rounded shrink-0">
              {t('Page')} {page}
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {slide.metrics.map((m) => (
              <div key={m.label} className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-[11px] uppercase font-bold text-slate-500 block">{t(m.label)}</span>
                <span className="text-lg font-bold font-heading text-slate-900">{m.value}</span>
                {m.sub && <span className="text-[11px] text-slate-500 block">{t(m.sub)}</span>}
              </div>
            ))}
          </div>
        </section>
      )}
      {sections.map((section) => {
        const hasText = section.items.some((item) => item.text);
        return (
          <section
            key={section.heading}
            className={framed ? 'bg-white rounded-xl shadow-card border border-slate-200 p-5' : 'rounded-xl border border-slate-200 p-4'}
          >
            <div className="flex items-center justify-between gap-2 pb-2.5 mb-3 border-b border-slate-100">
              <h3 className="text-xs sm:text-sm font-bold font-heading uppercase text-slate-800">
                {t(section.heading)}
              </h3>
              {framed && (
                <span className="text-[11px] font-bold uppercase tracking-wider text-kmc-navy bg-blue-50 px-2 py-0.5 rounded shrink-0">
                  {t('Page')} {page}
                </span>
              )}
            </div>
            {hasText ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {section.items.map((item) => (
                  <div key={item.title} className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                    <p className="text-xs font-bold text-slate-900 leading-snug">{t(item.title)}</p>
                    {item.text && <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">{t(item.text)}</p>}
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {section.items.map((item) => (
                  <span
                    key={item.title}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-800 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-full"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                    {t(item.title)}
                  </span>
                ))}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
};
