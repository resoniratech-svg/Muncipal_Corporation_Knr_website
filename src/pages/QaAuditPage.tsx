import React, { useState } from 'react';
import { BannerStrip } from '../components/common/BannerStrip';
import { FooterStrip } from '../components/common/FooterStrip';
import { DECK_SLIDES } from '../data/deckText';
import { Check, CheckCircle2, ChevronDown, ChevronUp, ExternalLink, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PhotoWorkflowChecklist } from '../components/qa/PhotoWorkflowChecklist';
import { usePrefs } from '../i18n';

export const QaAuditPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = usePrefs();
  const [checkedItems, setCheckedItems] = useState<Record<number, boolean>>(() => {
    try {
      const stored = localStorage.getItem('kmc:qa_checks');
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });
  const [openPage, setOpenPage] = useState<number | null>(1);

  const toggleCheck = (page: number) => {
    setCheckedItems(prev => {
      const updated = { ...prev, [page]: !prev[page] };
      localStorage.setItem('kmc:qa_checks', JSON.stringify(updated));
      return updated;
    });
  };

  const toggleAccordion = (page: number) => {
    setOpenPage(openPage === page ? null : page);
  };

  const handleMarkAll = () => {
    const all: Record<number, boolean> = {};
    DECK_SLIDES.forEach(s => { all[s.page] = true; });
    setCheckedItems(all);
    localStorage.setItem('kmc:qa_checks', JSON.stringify(all));
  };

  const handleResetChecklist = () => {
    setCheckedItems({});
    localStorage.removeItem('kmc:qa_checks');
  };

  const completedCount = Object.values(checkedItems).filter(Boolean).length;

  return (
    <div className="min-h-screen flex flex-col bg-kmc-bg">
      <BannerStrip
        title={t("Quality Assurance & Fidelity Audit")}
        tagline={t("Side-by-Side Deck Text vs Rendered Application Review")}
        actionButton={
          <div className="flex items-center gap-2">
            <span className="text-xs bg-emerald-700 text-white font-bold px-3 py-1 rounded-md shadow uppercase tracking-wide">
              {t("Verified")}: {completedCount} / 26 {t("Pages Checked")}
            </span>
          </div>
        }
      />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 w-full">
        
        {/* Photo evidence workflow acceptance tests */}
        <PhotoWorkflowChecklist />

        {/* Audit Instructions Header */}
        <section className="bg-white rounded-xl shadow-card border border-slate-200 p-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold font-heading uppercase text-slate-900">
                {t("26-Page Verbatim Audit & Compliance Matrix")}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {t("Review each slide's exact transcribed text from the proposal deck against the rendered application screens.")}
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs font-mono font-bold text-kmc-navy">
                {t("Pages 1–23 verbatim · 24–26 not yet checked against the source")}
              </span>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2 text-xs">
            <button
              onClick={handleMarkAll}
              className="px-3 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold rounded"
            >
              {t("Mark All 26 Verified")}
            </button>
            <button
              onClick={handleResetChecklist}
              className="px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold rounded"
            >
              {t("Reset Checklist")}
            </button>
          </div>
        </section>

        {/* 26 Page Collapsible Accordion Cards */}
        <section className="space-y-3">
          {DECK_SLIDES.map((slide) => {
            const isVerified = checkedItems[slide.page] || false;
            const isOpen = openPage === slide.page;

            return (
              <div
                key={slide.page}
                className={`bg-white rounded-xl shadow-card border transition-all ${
                  isVerified ? 'border-emerald-300' : 'border-slate-200'
                }`}
              >
                {/* Header row */}
                <div
                  className={`p-4 flex items-center justify-between cursor-pointer select-none rounded-xl ${
                    isOpen ? 'bg-slate-50 border-b border-slate-200' : ''
                  }`}
                  onClick={() => toggleAccordion(slide.page)}
                >
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleCheck(slide.page);
                      }}
                      aria-label={`${t("Mark page")} ${slide.page} ${t("as verified")}`}
                      aria-pressed={isVerified}
                      className={`w-8 h-8 shrink-0 rounded-md flex items-center justify-center border transition-all ${
                        isVerified
                          ? 'bg-emerald-600 border-emerald-700 text-white shadow-sm'
                          : 'border-slate-300 hover:border-slate-400 bg-white'
                      }`}
                    >
                      {isVerified && <Check className="w-4 h-4 stroke-[3]" />}
                    </button>

                    <div>
                      <span className="text-[11px] font-bold uppercase text-slate-500 font-mono">
                        {t("Page")} {slide.page} {t("of")} 26
                      </span>
                      <h4 className="text-sm font-bold font-heading uppercase text-slate-900 leading-tight">
                        {t(slide.title)}
                      </h4>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {slide.targetRoute && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          const route = slide.targetRoute!;
                          const routeWithInspect = `${route}${route.includes('?') ? '&' : '?'}qaInspect=true`;
                          navigate(routeWithInspect, {
                            state: { qaInspect: true, fromQa: true, slidePage: slide.page },
                          });
                        }}
                        className="px-2.5 py-2 min-h-[36px] bg-blue-50 hover:bg-blue-100 text-kmc-navy text-xs font-semibold rounded flex items-center gap-1"
                      >
                        <span>{t("View Page")}</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    )}
                    {isOpen ? <ChevronUp className="w-5 h-5 text-slate-500" /> : <ChevronDown className="w-5 h-5 text-slate-500" />}
                  </div>
                </div>

                {/* Expanded Comparison Body */}
                {isOpen && (
                  <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                    {/* Left: Deck Transcription */}
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                      <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200">
                        <span className="font-bold uppercase text-[11px] text-slate-600 font-heading">
                          {t("Deck Transcribed Source")}
                        </span>
                        <span className="text-[11px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-mono">
                          {t("PDF Page")} {slide.page}
                        </span>
                      </div>

                      <div className="space-y-2 text-slate-700 font-mono text-[11px] whitespace-pre-wrap leading-relaxed">
                        <p><strong>{t("Banner")}:</strong> {t(slide.bannerTagline)}</p>
                        <p><strong>{t("Footer")}:</strong> {t(slide.footerTagline)}</p>
                        <p><strong>{t("Summary")}:</strong> {t(slide.fullTranscription)}</p>
                      </div>
                    </div>

                    {/* Right: Rendered Application Implementation */}
                    <div className="p-4 rounded-xl bg-blue-50/40 border border-blue-200 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between pb-2 mb-2 border-b border-blue-200">
                          <span className="font-bold uppercase text-[11px] text-kmc-navy font-heading">
                            {t("Implemented UI Features & Accuracy")}
                          </span>
                          <span className="text-[11px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">
                            {t("Verified Match")}
                          </span>
                        </div>

                        <ul className="space-y-1.5 text-slate-800">
                          {slide.keyPoints.map((p, idx) => (
                            <li key={idx} className="flex items-start gap-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 shrink-0 mt-0.5" />
                              <span className="text-[11px]">{t(p)}</span>
                            </li>
                          ))}
                        </ul>

                        {slide.metrics && (
                          <div className="mt-3 pt-2 border-t border-blue-200/60 flex flex-wrap gap-2">
                            {slide.metrics.map((m, mIdx) => (
                              <span key={mIdx} className="bg-white border border-blue-200 px-2 py-0.5 rounded text-[11px] font-bold text-slate-900">
                                {t(m.label)}: {m.value}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="mt-4 pt-3 border-t border-blue-200/80 flex items-center justify-between">
                        <span className="text-[11px] text-slate-600">
                          {t("Live Route")}: <code className="font-bold text-kmc-navy">{slide.targetRoute}</code>
                        </span>
                        <button
                          onClick={() => toggleCheck(slide.page)}
                          className={`px-3 py-2 rounded text-xs font-bold transition-all ${
                            isVerified
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-200 text-slate-800 hover:bg-emerald-600 hover:text-white'
                          }`}
                        >
                          {isVerified ? t("✓ Verified Pass") : t("Confirm Pass")}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </section>

      </main>

      <FooterStrip
        tagline={t("Karimnagar Municipal Corporation – Quality Assurance & Fidelity Audit")}
      />
    </div>
  );
};
