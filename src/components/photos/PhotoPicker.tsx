import React, { useRef, useState } from 'react';
import { Camera, ImagePlus, Trash2, RefreshCw, AlertCircle, Loader2 } from 'lucide-react';
import { compressPhoto, PhotoError, MAX_PHOTOS, resolvePhoto } from '../../photos/photoStore';
import { FullImagePreview } from '../common/FullImagePreview';
import { usePrefs } from '../../i18n';

interface PhotoPickerProps {
  /** Compressed data URLs (not yet saved to storage) */
  photos: string[];
  onChange: (photos: string[]) => void;
  max?: number;
  english?: boolean;
  /** Alt-text prefix, e.g. "Before photo" */
  altPrefix: string;
}

/**
 * Camera or gallery picker for 1–3 photos (JPG/PNG/WEBP, ≤ 5 MB each), compressed to ≤ 1280px.
 * Each preview has Remove and Change photo; errors are friendly and say how to fix them.
 */
export const PhotoPicker: React.FC<PhotoPickerProps> = ({ photos, onChange, max = MAX_PHOTOS, english, altPrefix }) => {
  const prefs = usePrefs();
  const t = english ? prefs.tEn : prefs.t;
  const cameraRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);
  const replaceIndex = useRef<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setError(null);
    const replacing = replaceIndex.current;
    replaceIndex.current = null;
    const room = replacing !== null ? 1 : max - photos.length;
    const chosen = Array.from(files);
    if (chosen.length > room) setError(t('photoError.count'));

    setBusy(true);
    const next = [...photos];
    for (const file of chosen.slice(0, Math.max(0, room))) {
      try {
        const dataUrl = await compressPhoto(file);
        if (replacing !== null) next[replacing] = dataUrl;
        else next.push(dataUrl);
      } catch (err) {
        const code = err instanceof PhotoError ? err.code : 'read';
        setError(t(`photoError.${code}`));
      }
    }
    setBusy(false);
    onChange(next);
    if (cameraRef.current) cameraRef.current.value = '';
    if (galleryRef.current) galleryRef.current.value = '';
  };

  const canAdd = photos.length < max && !busy;

  return (
    <div className="space-y-4">
      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
        onChange={(e) => handleFiles(e.target.files)}
        data-testid="photo-camera-input"
      />
      <input
        ref={galleryRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
        onChange={(e) => handleFiles(e.target.files)}
        data-testid="photo-gallery-input"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button
          type="button"
          disabled={!canAdd}
          onClick={() => cameraRef.current?.click()}
          className="min-h-[56px] rounded-xl bg-kmc-navy text-white text-base font-bold flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <Camera className="w-6 h-6" aria-hidden="true" />
          {t('report.takePhoto')}
        </button>
        <button
          type="button"
          disabled={!canAdd}
          onClick={() => galleryRef.current?.click()}
          className="min-h-[56px] rounded-xl border-2 border-kmc-navy text-kmc-navy bg-white text-base font-bold flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <ImagePlus className="w-6 h-6" aria-hidden="true" />
          {t('report.choosePhoto')}
        </button>
      </div>

      {busy && (
        <p className="flex items-center gap-2 text-base text-slate-700" role="status">
          <Loader2 className="w-5 h-5 animate-spin motion-reduce:animate-none" aria-hidden="true" />
          {t('report.preparing')}
        </p>
      )}

      {error && (
        <p role="alert" className="flex items-start gap-2 rounded-xl border-2 border-rose-300 bg-rose-50 p-3 text-base text-rose-900">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" aria-hidden="true" />
          {error}
        </p>
      )}

      {photos.length > 0 && (
        <ul className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {photos.map((src, i) => (
            <li key={i} className="rounded-xl border-2 border-slate-200 bg-white overflow-hidden flex flex-col">
              <div className="h-44 bg-slate-950 flex-1">
                <FullImagePreview
                  src={resolvePhoto(src)}
                  alt={`${altPrefix} ${i + 1}`}
                  title={`${altPrefix} ${i + 1}`}
                  variant="preview"
                  className="w-full h-full"
                />
              </div>
              <div className="grid grid-cols-2">
                <button
                  type="button"
                  onClick={() => onChange(photos.filter((_, idx) => idx !== i))}
                  className="min-h-[48px] flex items-center justify-center gap-1.5 text-base font-semibold text-rose-800 hover:bg-rose-50 border-t-2 border-slate-200"
                >
                  <Trash2 className="w-4 h-4" aria-hidden="true" />
                  {t('report.remove')}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    replaceIndex.current = i;
                    galleryRef.current?.click();
                  }}
                  className="min-h-[48px] flex items-center justify-center gap-1.5 text-base font-semibold text-kmc-navy hover:bg-blue-50 border-t-2 border-l-2 border-slate-200"
                >
                  <RefreshCw className="w-4 h-4" aria-hidden="true" />
                  {t('report.change')}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
