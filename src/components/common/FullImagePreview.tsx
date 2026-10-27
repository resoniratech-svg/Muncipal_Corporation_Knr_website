import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Maximize2, X, CalendarClock, MapPin, ImageOff, Camera } from 'lucide-react';
import { resolveAssetSrc } from './ImageWithFallback';
import { usePrefs } from '../../i18n';

export interface FullImageModalProps {
  src: string;
  alt: string;
  title?: string;
  caption?: string;
  location?: string;
  date?: string;
  badge?: string;
  badgeVariant?: 'before' | 'after' | 'navy' | 'amber' | 'emerald' | 'slate';
  onClose: () => void;
}

/**
 * Centered modal overlay that renders the photograph at its full natural aspect ratio
 * using object-contain. Meets Section 4 requirements:
 * - Backdrop darkened with blur
 * - Click outside image closes modal
 * - Escape key closes modal
 * - Clearly visible close button with accessible focus
 * - Body scroll locking while open
 * - Focus restore on dismiss
 * - Responsive bounds: max-w-[95vw], max-h-[90vh]
 */
export const FullImageModal: React.FC<FullImageModalProps> = ({
  src,
  alt,
  title,
  caption,
  location,
  date,
  badge,
  badgeVariant = 'navy',
  onClose,
}) => {
  const { t } = usePrefs();
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    // Save previously focused element
    previouslyFocusedRef.current = document.activeElement as HTMLElement | null;
    closeBtnRef.current?.focus();

    // Prevent background scrolling
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Handle Escape key
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
      // Restore focus to trigger
      previouslyFocusedRef.current?.focus();
    };
  }, [onClose]);

  const badgeBg =
    badgeVariant === 'before'
      ? 'bg-orange-700 text-white'
      : badgeVariant === 'after'
      ? 'bg-emerald-700 text-white'
      : badgeVariant === 'amber'
      ? 'bg-amber-600 text-white'
      : badgeVariant === 'emerald'
      ? 'bg-emerald-600 text-white'
      : 'bg-kmc-navy text-white';

  const displayTitle = title ? t(title) : t('Civic Evidence Photograph');

  return (
    <div
      className="fixed inset-0 z-[100] bg-slate-950/85 backdrop-blur-md flex flex-col items-center justify-center p-3 sm:p-5 animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-label={alt || displayTitle}
      onClick={onClose}
    >
      <div
        className="w-full max-w-[95vw] max-h-[92vh] flex flex-col bg-slate-900 rounded-2xl border border-slate-700 shadow-2xl overflow-hidden animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-4 py-3 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between text-white shrink-0">
          <div className="flex items-center gap-2.5 min-w-0 pr-2">
            <Camera className="w-4 h-4 text-emerald-400 shrink-0" aria-hidden="true" />
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-xs sm:text-sm font-bold font-heading uppercase tracking-wide truncate text-white">
                  {displayTitle}
                </h3>
                {badge && (
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded shadow ${badgeBg}`}>
                    {t(badge)}
                  </span>
                )}
              </div>
              {caption && (
                <p className="text-[11px] text-slate-300 truncate">
                  {t(caption)}
                </p>
              )}
            </div>
          </div>

          <button
            ref={closeBtnRef}
            type="button"
            onClick={onClose}
            aria-label={t('Close preview')}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all focus:outline-none focus:ring-2 focus:ring-white shrink-0"
            title={t('Close (Esc)')}
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Modal Body: Complete Image via object-contain */}
        <div className="flex-1 min-h-[220px] max-h-[76vh] bg-slate-950 flex items-center justify-center p-2 sm:p-4 overflow-hidden relative">
          <img
            src={resolveAssetSrc(src)}
            alt={t(alt)}
            className="max-h-[74vh] max-w-full w-auto object-contain rounded-lg shadow-inner select-none"
          />
        </div>

        {/* Modal Footer: Metadata & Details */}
        {(location || date) && (
          <div className="px-4 py-2.5 bg-slate-900 border-t border-slate-800 text-[11px] sm:text-xs text-slate-300 flex flex-wrap items-center justify-between gap-2 shrink-0">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
              {date && (
                <span className="flex items-center gap-1.5 text-amber-300 font-mono">
                  <CalendarClock className="w-3.5 h-3.5 text-amber-400" aria-hidden="true" />
                  <span>{t(date)}</span>
                </span>
              )}
              {location && (
                <span className="flex items-center gap-1.5 text-slate-200">
                  <MapPin className="w-3.5 h-3.5 text-red-400" aria-hidden="true" />
                  <span>{t(location)}</span>
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-white text-[11px] font-bold uppercase tracking-wider transition-colors ml-auto"
            >
              {t('Close')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export interface FullImagePreviewProps {
  src?: string;
  alt: string;
  title?: string;
  caption?: string;
  location?: string;
  date?: string;
  badge?: string;
  badgeVariant?: 'before' | 'after' | 'navy' | 'amber' | 'emerald' | 'slate';
  variant?: 'beforeAfter' | 'card' | 'thumbnail' | 'preview' | 'compact' | 'custom';
  aspectRatio?: '16/9' | '4/3' | '1/1' | 'auto';
  className?: string;
  imgClassName?: string;
  clickable?: boolean;
  showZoomIcon?: boolean;
  fallbackText?: string;
  children?: React.ReactNode;
}

/**
 * Standardized reusable image component for the entire KMC platform.
 * Ensures:
 * 1. Consistent container sizing within each variant
 * 2. Full-image visibility using object-contain on neutral background
 * 3. Never stretches, distorts, or clips essential photo content
 * 4. Clicking opens the accessible full-size modal popup
 */
export const FullImagePreview: React.FC<FullImagePreviewProps> = ({
  src,
  alt,
  title,
  caption,
  location,
  date,
  badge,
  badgeVariant = 'navy',
  variant = 'preview',
  aspectRatio = 'auto',
  className = '',
  imgClassName = '',
  clickable = true,
  showZoomIcon = true,
  fallbackText = 'Image unavailable',
  children,
}) => {
  const { t } = usePrefs();
  const [hasError, setHasError] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleOpen = useCallback(() => {
    if (clickable && src && !hasError) {
      setIsOpen(true);
    }
  }, [clickable, src, hasError]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if ((e.key === 'Enter' || e.key === ' ') && clickable && src && !hasError) {
        e.preventDefault();
        setIsOpen(true);
      }
    },
    [clickable, src, hasError]
  );

  if (!src || hasError) {
    return (
      <div
        className={`bg-slate-900/5 dark:bg-slate-900 border border-slate-200 rounded-xl flex flex-col items-center justify-center p-3 text-center text-slate-500 ${className}`}
        role="img"
        aria-label={t(alt)}
      >
        <ImageOff className="w-6 h-6 mb-1 text-slate-400" aria-hidden="true" />
        <span className="text-[11px] font-medium text-slate-500 line-clamp-1">{t(fallbackText)}</span>
      </div>
    );
  }

  // Dimension classes based on variant
  let containerDimensions = 'w-full min-h-[140px]';
  if (variant === 'thumbnail') {
    containerDimensions = 'w-16 h-16 sm:w-20 sm:h-20';
  } else if (variant === 'compact') {
    containerDimensions = 'w-full h-40 sm:h-48';
  } else if (variant === 'beforeAfter') {
    containerDimensions = 'w-full h-64 sm:h-72 lg:h-80';
  } else if (variant === 'card') {
    containerDimensions = 'w-full h-48 sm:h-56';
  } else if (variant === 'preview') {
    containerDimensions = 'w-full h-56 sm:h-64';
  }

  const badgeBg =
    badgeVariant === 'before'
      ? 'bg-orange-700 text-white'
      : badgeVariant === 'after'
      ? 'bg-emerald-700 text-white'
      : badgeVariant === 'amber'
      ? 'bg-amber-600 text-white'
      : badgeVariant === 'emerald'
      ? 'bg-emerald-600 text-white'
      : 'bg-kmc-navy text-white';

  const resolved = resolveAssetSrc(src);

  return (
    <>
      <div
        role={clickable ? 'button' : undefined}
        tabIndex={clickable ? 0 : undefined}
        onClick={handleOpen}
        onKeyDown={handleKeyDown}
        aria-label={clickable ? `${t('View full size image')}: ${t(alt)}` : t(alt)}
        className={`group relative rounded-xl overflow-hidden bg-slate-950 border border-slate-200 flex items-center justify-center transition-all ${
          clickable ? 'cursor-pointer hover:border-kmc-navy/50 focus:outline-none focus:ring-2 focus:ring-kmc-navy' : ''
        } ${containerDimensions} ${className}`}
        title={clickable ? t('Click to open full-size image') : undefined}
      >
        {/* Full image displayed via object-contain: NEVER CROPPED */}
        <img
          src={resolved}
          alt={t(alt)}
          loading="lazy"
          onError={() => setHasError(true)}
          className={`w-full h-full object-contain select-none transition-transform duration-200 ${
            clickable ? 'group-hover:scale-[1.02]' : ''
          } ${imgClassName}`}
        />

        {/* Optional Badge */}
        {badge && (
          <span className={`absolute top-2 left-2 px-2.5 py-0.5 rounded-full text-xs font-bold shadow ${badgeBg}`}>
            {t(badge)}
          </span>
        )}

        {/* Zoom Icon indicator */}
        {clickable && showZoomIcon && (
          <div className="absolute bottom-2 right-2 w-8 h-8 rounded-full bg-slate-950/75 hover:bg-slate-900 text-white flex items-center justify-center opacity-80 group-hover:opacity-100 transition-opacity shadow">
            <Maximize2 className="w-4 h-4" aria-hidden="true" />
          </div>
        )}

        {children}
      </div>

      {/* Lightbox Popup */}
      {isOpen && (
        <FullImageModal
          src={src}
          alt={alt}
          title={title}
          caption={caption}
          location={location}
          date={date}
          badge={badge}
          badgeVariant={badgeVariant}
          onClose={() => setIsOpen(false)}
        />
      )}
    </>
  );
};
