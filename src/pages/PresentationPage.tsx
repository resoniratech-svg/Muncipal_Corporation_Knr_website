import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DECK_SLIDES } from '../data/deckText';
import { 
  ChevronLeft, ChevronRight, Play, ExternalLink, 
  Layers, Maximize2, CheckCircle2, Home 
} from 'lucide-react';
import kmcLogo from '../assets/kmc-logo.svg';
import { ImageWithFallback } from '../components/common/ImageWithFallback';
import { DeckSections } from '../components/common/DeckSections';
import { SearchableSelect } from '../components/common/SearchableSelect';
import { FullImageModal } from '../components/common/FullImagePreview';
import { usePrefs } from '../i18n';

const SLIDE_PHOTOS: Record<number, { img: string; caption: string; tag: string }> = {
  1: {
    img: 'images/city/kmc-headquarters.jpg',
    caption: 'Karimnagar Municipal Corporation (నగరపాలక సంస్థ కరీంనగర్) Administrative Headquarters',
    tag: 'Municipal Head Office',
  },
  6: {
    img: 'images/civic-works/cable-bridge.jpg',
    caption: 'Tier 2 Ward Management: Monitoring Major Civic Works & Manair Cable Bridge Approaches',
    tag: 'Civic Works Execution',
  },
  7: {
    img: 'images/parks-projects/urban-park.jpg',
    caption: 'Tier 3 Citizen Engagement: Ward Development Projects & Public Recreational Parks',
    tag: 'Public Development',
  },
  15: {
    img: 'images/sanitation/sanitation-collection.jpg',
    caption: 'Sanitation Wing Field Operations: Door-to-Door Waste Collection & Pushcart Fleets',
    tag: 'Field Operations',
  },
  19: {
    img: 'images/civic-works/street-lighting.jpg',
    caption: 'Smart City Public Infrastructure: Energy-Efficient LED Lighting & Avenue Illumination',
    tag: 'Street Lighting Grid',
  },
  26: {
    img: 'images/city/cable-bridge.jpg',
    caption: 'Towards Smart, Transparent and Citizen-Centric Governance across all 66 Wards of Karimnagar',
    tag: 'Model Municipal Corporation',
  },
};

export const PresentationPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = usePrefs();
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [spotlightModal, setSpotlightModal] = useState<boolean>(false);

  const slide = DECK_SLIDES[currentSlideIndex];
  const totalSlides = DECK_SLIDES.length;

  const goToPrev = () => {
    setCurrentSlideIndex((prev) => (prev > 0 ? prev - 1 : prev));
  };

  const goToNext = () => {
    setCurrentSlideIndex((prev) => (prev < totalSlides - 1 ? prev + 1 : prev));
  };

  // Keyboard navigation (Left / Right / Space)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Leave keys alone while the slide selector has focus
      if (e.target instanceof HTMLSelectElement) return;
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        goToNext();
      } else if (e.key === 'ArrowLeft') {
        goToPrev();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between selection:bg-amber-400 selection:text-slate-950">
      
      {/* Presentation Top Control Bar */}
      <header className="bg-slate-900/90 backdrop-blur border-b border-slate-800 px-4 py-2.5 flex items-center justify-between text-xs sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="h-9 min-w-[36px] px-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white flex items-center justify-center gap-1.5 font-semibold"
            title={t('Return to Home')}
            aria-label={t('Exit presentation and return to home')}
          >
            <Home className="w-4 h-4" aria-hidden="true" />
            <span className="hidden sm:inline">{t('Exit Demo')}</span>
          </button>
          <div className="flex items-center gap-2">
            <img src={kmcLogo} alt="KMC" className="w-6 h-6 object-contain" />
            <span className="font-bold font-heading uppercase text-amber-300 hidden md:inline">
              {t('Karimnagar Municipal Corporation')} – {t('Digital Governance Platform Proposal')}
            </span>
          </div>
        </div>

        {/* Slide Counter & Jump Dropdown */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <label htmlFor="present-jump" className="text-slate-300 text-xs font-semibold mr-1 hidden sm:inline">{t('Slide')}</label>
            <SearchableSelect
              id="present-jump"
              value={currentSlideIndex}
              onChange={(val) => setCurrentSlideIndex(Number(val))}
              variant="dark"
              size="sm"
              searchPlaceholder={t('Search 26 slides...')}
              options={DECK_SLIDES.map((s, idx) => ({
                value: idx,
                label: `${t('Page')} ${s.page}: ${t(s.title)}`,
                badge: `${t('Slide')} ${s.page}`,
              }))}
              className="w-44 sm:w-64"
            />
            <span className="text-slate-300 text-xs ml-1 whitespace-nowrap">/ {totalSlides}</span>
          </div>

          {slide.targetRoute && (
            <button
              onClick={() => navigate(slide.targetRoute!)}
              aria-label={t('Open live demo')}
              className="h-9 min-w-[36px] px-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-lg text-xs flex items-center justify-center gap-1.5 shadow whitespace-nowrap"
            >
              <span className="hidden sm:inline">{t('Open Live Demo')}</span>
              <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          )}
        </div>
      </header>

      {/* Slide Body Canvas (Aspect Ratio 16:9 responsive frame) */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-5xl bg-white text-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col justify-between min-h-[580px]">
          
          {/* Top Banner on Slide Canvas */}
          <div className="bg-kmc-navy text-white px-6 py-4 flex items-center justify-between border-b-2 border-amber-400">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white/10 p-1 flex items-center justify-center border border-amber-400">
                <img src={kmcLogo} alt="KMC" className="w-full h-full object-contain" />
              </div>
              <div>
                <span className="text-[11px] uppercase font-bold text-amber-300 tracking-wider">
                  {t('Page')} {slide.page} {t('of')} 26
                </span>
                <h2 className="text-base sm:text-lg font-bold font-heading uppercase tracking-wide leading-none text-slate-100">
                  {t(slide.title)}
                </h2>
              </div>
            </div>

            <div className="text-right hidden sm:block">
              <span className="text-[11px] text-amber-300 font-semibold uppercase tracking-wider block">
                {t('Official Proposal')}
              </span>
              <span className="text-xs text-slate-200">{t(slide.bannerTagline)}</span>
            </div>
          </div>

          {/* Slide Content Interior */}
          <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between space-y-6">
            
            {/* Banner Tagline (Mobile & Tablet) */}
            <div className="sm:hidden p-2 rounded bg-blue-50 text-kmc-navy text-xs font-semibold uppercase">
              {t(slide.bannerTagline)}
            </div>

            {slide.subtitle && (
              <p className="text-sm sm:text-base text-slate-600 font-medium italic">{t(slide.subtitle)}</p>
            )}

            {/* Key Bullet Points */}
            {slide.keyPoints.length > 0 && (
            <div className="space-y-3">
              {slide.keyPoints.map((point, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-blue-50 text-kmc-navy font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 border border-blue-200">
                    {idx + 1}
                  </div>
                  <p className="text-sm sm:text-base text-slate-800 leading-relaxed font-medium">
                    {t(point)}
                  </p>
                </div>
              ))}
            </div>
            )}

            <DeckSections page={slide.page} framed={false} />

            {/* Authentic Karimnagar Infrastructure Spotlight for Key Slides */}
            {SLIDE_PHOTOS[slide.page] && (
              <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-50 shadow-sm flex flex-col sm:flex-row">
                <div 
                  className="sm:w-1/3 h-36 sm:h-auto min-h-[120px] relative shrink-0 cursor-pointer group bg-slate-950"
                  onClick={() => setSpotlightModal(true)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSpotlightModal(true); } }}
                  aria-label={t("View full size image of {{title}}", { title: SLIDE_PHOTOS[slide.page].caption })}
                >
                  <ImageWithFallback
                    src={SLIDE_PHOTOS[slide.page].img}
                    alt={SLIDE_PHOTOS[slide.page].caption}
                    className="w-full h-full object-contain"
                  />
                  <span className="absolute top-2 left-2 bg-kmc-navy/85 backdrop-blur text-white text-[11px] font-bold px-2 py-0.5 rounded shadow">
                    {t(SLIDE_PHOTOS[slide.page].tag)}
                  </span>
                  <div className="absolute inset-0 bg-slate-950/0 group-hover:bg-slate-950/30 transition-all flex items-center justify-center pointer-events-none">
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 text-white p-1.5 rounded-full shadow">
                      <Maximize2 className="w-4 h-4" />
                    </span>
                  </div>
                </div>
                <div className="p-3 sm:p-4 flex flex-col justify-center bg-white">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 mb-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{t('Ground Infrastructure Spotlight · Karimnagar')}</span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed">
                    {t(SLIDE_PHOTOS[slide.page].caption)}
                  </p>
                </div>
              </div>
            )}

            {/* Optional Slide Tables (e.g. Page 2, Page 9, Page 14, Page 24) */}
            {slide.tables && slide.tables.length > 0 && (
              <div className="space-y-4">
                {slide.tables.map((table, tIdx) => (
                  <div key={tIdx} className="overflow-x-auto rounded-xl border border-slate-200">
                  <div className="px-3 py-2 bg-slate-50 text-[11px] font-bold uppercase text-slate-700 border-b border-slate-200">{t(table.title)}</div>
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[11px] border-b border-slate-200">
                      <tr>
                        {table.headers.map((h, hIdx) => (
                          <th key={hIdx} className="py-2.5 px-3">{t(h)}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {table.rows.map((row, rIdx) => (
                        <tr key={rIdx} className="hover:bg-slate-50">
                          {row.map((cell, cIdx) => (
                            <td key={cIdx} className="py-2 px-3 font-medium text-slate-800">
                              {t(String(cell))}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  </div>
                ))}
              </div>
            )}

            {/* Optional Slide Metrics Badges */}
            {slide.metrics && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                {slide.metrics.map((m, mIdx) => (
                  <div key={mIdx} className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[11px] font-bold uppercase text-slate-500 block">{t(m.label)}</span>
                    <span className="text-xl font-extrabold font-heading text-slate-900">{m.value}</span>
                    {m.sub && <span className="text-[11px] text-slate-600 block mt-0.5">{t(m.sub)}</span>}
                  </div>
                ))}
              </div>
            )}

          </div>

          {/* Deck-Exact Footer on Slide Canvas */}
          <div className="bg-slate-100 px-6 py-3 border-t border-slate-200 text-xs text-slate-600 flex flex-col sm:flex-row items-center justify-between gap-2">
            <span className="font-semibold text-slate-800">{t(slide.footerTagline)}</span>
            <span className="text-[11px] text-slate-600 font-mono">
              {t('Karimnagar Municipal Corporation • Slide')} {slide.page} / 26
            </span>
          </div>

        </div>
      </main>

      {/* Bottom Navigation Dock */}
      <footer className="bg-slate-900 border-t border-slate-800 px-3 sm:px-6 py-3 flex items-center justify-between gap-2">
        <button
          onClick={goToPrev}
          disabled={currentSlideIndex === 0}
          className="px-4 py-2 min-h-[36px] bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-slate-800 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden sm:inline">{t('Previous Slide (←)')}</span>
          <span className="sm:hidden">{t('Back')}</span>
        </button>

        <span className="lg:hidden text-xs font-bold text-slate-300">{currentSlideIndex + 1} / {totalSlides}</span>
        <div className="hidden lg:flex items-center">
          {DECK_SLIDES.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setCurrentSlideIndex(idx)}
              aria-label={`${t('Jump to Page')} ${idx + 1}`}
              aria-current={idx === currentSlideIndex ? 'step' : undefined}
              title={`${t('Jump to Page')} ${idx + 1}`}
              className="group h-8 px-[3px] flex items-center"
            >
              <span
                className={`block h-2.5 rounded-full transition-all ${
                  idx === currentSlideIndex ? 'bg-amber-400 w-6' : 'w-2.5 bg-slate-600 group-hover:bg-slate-400'
                }`}
              />
            </button>
          ))}
        </div>

        <button
          onClick={goToNext}
          disabled={currentSlideIndex === totalSlides - 1}
          className="px-4 py-2 min-h-[36px] bg-amber-400 hover:bg-amber-300 disabled:opacity-40 disabled:hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all shadow"
        >
          <span className="hidden sm:inline">{t('Next Slide (→ / Space)')}</span>
          <span className="sm:hidden">{t('Next')}</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </footer>

      {spotlightModal && SLIDE_PHOTOS[slide.page] && (
        <FullImageModal
          onClose={() => setSpotlightModal(false)}
          src={SLIDE_PHOTOS[slide.page].img}
          alt={SLIDE_PHOTOS[slide.page].caption}
          title={t(SLIDE_PHOTOS[slide.page].caption)}
        />
      )}
    </div>
  );
};
