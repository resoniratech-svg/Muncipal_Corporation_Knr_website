import React, { useState } from 'react';
import { Camera, Maximize2 } from 'lucide-react';
import { resolveAssetSrc } from './ImageWithFallback';
import { isPhotoSource } from '../../data/grievances';
import { usePrefs } from '../../i18n';
import { FullImageModal } from './FullImagePreview';

export { FullImageModal as EvidencePhotoModal };

interface PhotoThumbnailProps {
  src?: string;
  alt?: string;
  location?: string;
  date?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const PhotoThumbnail: React.FC<PhotoThumbnailProps> = ({
  src,
  alt = 'Site Photo',
  location,
  date,
  className = '',
  size = 'md',
}) => {
  const { t } = usePrefs();
  const [isOpen, setIsOpen] = useState(false);

  if (!src) return null;

  const isImage = isPhotoSource(src);

  if (!isImage) {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-mono bg-emerald-50 text-emerald-800 px-1.5 py-0.5 rounded border border-emerald-200">
        <Camera className="w-3 h-3 text-emerald-600" />
        <span className="truncate max-w-[100px]">{src}</span>
      </span>
    );
  }

  const dimClass =
    size === 'sm'
      ? 'w-9 h-9 sm:w-10 sm:h-10'
      : size === 'lg'
      ? 'w-20 h-20 sm:w-24 sm:h-24'
      : 'w-12 h-12 sm:w-14 sm:h-14';

  const resolved = resolveAssetSrc(src);

  return (
    <>
      <div
        role="button"
        tabIndex={0}
        onClick={() => setIsOpen(true)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsOpen(true);
          }
        }}
        className={`relative inline-flex items-center justify-center cursor-pointer group rounded-lg overflow-hidden border border-emerald-400/60 hover:border-kmc-navy bg-slate-950 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-kmc-navy ${dimClass} ${className}`}
        title={t('Click to open full-size image')}
        aria-label={`${t('View full size image')}: ${t(alt)}`}
      >
        <img
          src={resolved}
          alt={t(alt)}
          loading="lazy"
          className="w-full h-full object-contain group-hover:scale-105 transition-transform select-none"
        />
        <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
          <Maximize2 className="w-3.5 h-3.5 drop-shadow" aria-hidden="true" />
        </div>
      </div>

      {isOpen && (
        <FullImageModal
          src={resolved}
          alt={alt}
          title={alt}
          location={location}
          date={date}
          onClose={() => setIsOpen(false)}
        />
      )}
    </>
  );
};
