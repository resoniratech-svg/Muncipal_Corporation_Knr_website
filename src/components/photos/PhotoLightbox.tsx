import React from 'react';
import { PhotoEvidence } from '../../photos/photoStore';
import { FullImageModal } from '../common/FullImagePreview';

interface PhotoLightboxProps {
  photo: PhotoEvidence;
  label: string;
  alt: string;
  closeLabel?: string;
  onClose: () => void;
}

/** Full-screen photo with date, time and location (geo-tag) underneath. */
export const PhotoLightbox: React.FC<PhotoLightboxProps> = ({ photo, label, alt, onClose }) => {
  const isBefore = label.toLowerCase().includes('before') || label.toLowerCase().includes('ముందు') || label.toLowerCase().includes('पहले');
  const isAfter = label.toLowerCase().includes('after') || label.toLowerCase().includes('తరువాత') || label.toLowerCase().includes('बाद');

  return (
    <FullImageModal
      src={photo.src}
      alt={alt}
      title={label}
      location={`${photo.location} · ${photo.lat.toFixed(4)}, ${photo.lng.toFixed(4)}`}
      date={photo.takenAt}
      badge={label}
      badgeVariant={isBefore ? 'before' : isAfter ? 'after' : 'navy'}
      onClose={onClose}
    />
  );
};
