import React, { useState } from 'react';
import { Building, ImageOff } from 'lucide-react';
import { resolvePhoto } from '../../photos/photoStore';

// Public assets are referenced relative to index.html so the static build works
// under a sub-path; older persisted records may still carry a leading slash.
export const resolveAssetSrc = (src: string): string =>
  /^\/(images|landmarks)\//.test(src) ? src.slice(1) : resolvePhoto(src);

interface ImageWithFallbackProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  fallbackText?: string;
}

export const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
  src,
  alt,
  fallbackText = 'Image unavailable',
  className = '',
  loading = 'lazy',
  ...props
}) => {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <div
        className={`bg-slate-100 border border-slate-200 text-slate-500 flex flex-col items-center justify-center p-3 text-center ${className}`}
        role="img"
        aria-label={alt}
      >
        <ImageOff className="w-5 h-5 mb-1 text-slate-500" />
        <span className="text-[11px] font-medium text-slate-500 line-clamp-1">{fallbackText}</span>
      </div>
    );
  }

  return (
    <img
      src={resolveAssetSrc(src)}
      alt={alt}
      loading={loading}
      onError={() => setHasError(true)}
      className={className}
      {...props}
    />
  );
};
