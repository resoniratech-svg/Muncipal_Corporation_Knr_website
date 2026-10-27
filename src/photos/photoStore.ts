/**
 * Photo evidence storage (no backend).
 *
 * Uploaded photos are compressed in the browser (longest side ≤ 1280px, JPEG) and each one is
 * saved under its own localStorage key `kmc:photo:<id>`. Complaint records only hold the short
 * reference `kmc-photo:<id>`, so updating a complaint never rewrites megabytes of base64.
 * Authentic field evidence photos are stored in public/images/ and referenced directly.
 */

export interface PhotoEvidence {
  /** `kmc-photo:<id>` reference, bundled asset URL or data URL */
  src: string;
  takenAt: string;
  lat: number;
  lng: number;
  location: string;
}

export const DEMO_PHOTOS: Record<string, string> = {
  'drain-before': 'images/field-evidence/drain-before.jpg',
  'drain-after': 'images/field-evidence/drain-after.jpg',
  'road-before': 'images/field-evidence/road-before.jpg',
  'road-after': 'images/field-evidence/road-after.jpg',
  'garbage-before': 'images/sanitation/sanitation-collection.jpg',
  'garbage-after': 'images/field-evidence/sanitation-work.jpg',
  'light-before': 'images/civic-works/street-lighting.jpg',
  'light-after': 'images/field-evidence/street-lights-fixed.jpg',
  'water-before': 'images/field-evidence/water-before.jpg',
  'water-after': 'images/field-evidence/water-after.jpg',
  'park-before': 'images/field-evidence/park-beautification.jpg',
  'park-after': 'images/parks-projects/urban-park.jpg',
};

export const DEMO_PHOTO_PREFIX = 'demo-photo:';

export const PHOTO_REF_PREFIX = 'kmc-photo:';
export const PHOTO_KEY_PREFIX = 'kmc:photo:';
export const MAX_PHOTO_BYTES = 5 * 1024 * 1024;
export const MAX_PHOTOS = 3;
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_EDGE = 1280;
const TARGET_BYTES = 350 * 1024;

export type PhotoErrorCode = 'type' | 'size' | 'read' | 'quota' | 'count';

export class PhotoError extends Error {
  constructor(public code: PhotoErrorCode) {
    super(code);
  }
}

export const validatePhotoFile = (file: File): PhotoErrorCode | null => {
  if (!ACCEPTED_TYPES.includes(file.type)) return 'type';
  if (file.size > MAX_PHOTO_BYTES) return 'size';
  return null;
};

const loadImage = (file: File): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new PhotoError('read'));
    };
    img.src = url;
  });

/** Resizes to at most 1280px on the longest side and re-encodes as JPEG, lowering quality until small. */
export const compressPhoto = async (file: File): Promise<string> => {
  const problem = validatePhotoFile(file);
  if (problem) throw new PhotoError(problem);

  const img = await loadImage(file);
  const scale = Math.min(1, MAX_EDGE / Math.max(img.naturalWidth, img.naturalHeight));
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(img.naturalWidth * scale));
  canvas.height = Math.max(1, Math.round(img.naturalHeight * scale));
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new PhotoError('read');
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  let quality = 0.78;
  let dataUrl = canvas.toDataURL('image/jpeg', quality);
  // base64 is ~4/3 of the byte size
  while (dataUrl.length * 0.75 > TARGET_BYTES && quality > 0.4) {
    quality -= 0.12;
    dataUrl = canvas.toDataURL('image/jpeg', quality);
  }
  return dataUrl;
};

/** Saves a data URL and returns its reference. Throws PhotoError('quota') when storage is full. */
export const savePhoto = (dataUrl: string): string => {
  const id = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
  try {
    window.localStorage.setItem(PHOTO_KEY_PREFIX + id, dataUrl);
  } catch {
    throw new PhotoError('quota');
  }
  return PHOTO_REF_PREFIX + id;
};

export const isPhotoRef = (src: string) => src.startsWith(PHOTO_REF_PREFIX);

/** Turns a stored reference back into a displayable data URL; other sources pass through. */
export const resolvePhoto = (src: string): string => {
  if (!src) return '';
  if (src.startsWith(DEMO_PHOTO_PREFIX)) {
    const raw = DEMO_PHOTOS[src.slice(DEMO_PHOTO_PREFIX.length)] || '';
    return /^\/(images|landmarks)\//.test(raw) ? raw.slice(1) : raw;
  }
  if (!isPhotoRef(src)) {
    return /^\/(images|landmarks)\//.test(src) ? src.slice(1) : src;
  }
  try {
    return window.localStorage.getItem(PHOTO_KEY_PREFIX + src.slice(PHOTO_REF_PREFIX.length)) || '';
  } catch {
    return '';
  }
};

export const clearStoredPhotos = (): void => {
  try {
    const keys: string[] = [];
    for (let i = 0; i < window.localStorage.length; i++) {
      const k = window.localStorage.key(i);
      if (k && k.startsWith(PHOTO_KEY_PREFIX)) keys.push(k);
    }
    keys.forEach((k) => window.localStorage.removeItem(k));
  } catch {
    // storage unavailable: nothing to clear
  }
};

/** Approximate bytes used by uploaded photos, for the demo menu. */
export const storedPhotoBytes = (): number => {
  let total = 0;
  try {
    for (let i = 0; i < window.localStorage.length; i++) {
      const k = window.localStorage.key(i);
      if (k && k.startsWith(PHOTO_KEY_PREFIX)) total += (window.localStorage.getItem(k) || '').length * 2;
    }
  } catch {
    // ignore
  }
  return total;
};

export const nowStamp = (): string =>
  new Date().toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

export const makeEvidence = (src: string, location: string, lat: number, lng: number, takenAt = nowStamp()): PhotoEvidence => ({
  src,
  takenAt,
  lat,
  lng,
  location,
});

export const removePhoto = (ref: string): void => {
  if (!isPhotoRef(ref)) return;
  try {
    window.localStorage.removeItem(PHOTO_KEY_PREFIX + ref.slice(PHOTO_REF_PREFIX.length));
  } catch {
    // ignore
  }
};

/**
 * Saves compressed data URLs as photo evidence. On a quota error, photos saved so far are
 * removed again and `{ ok: false, error: 'quota' }` is returned so the caller can explain it.
 */
export const storePhotos = (
  dataUrls: string[],
  location: string,
  lat: number,
  lng: number
): { ok: true; photos: PhotoEvidence[] } | { ok: false; error: PhotoErrorCode } => {
  const saved: PhotoEvidence[] = [];
  for (const url of dataUrls) {
    try {
      saved.push(makeEvidence(isPhotoRef(url) || url.startsWith(DEMO_PHOTO_PREFIX) ? url : savePhoto(url), location, lat, lng));
    } catch {
      saved.forEach((p) => removePhoto(p.src));
      return { ok: false, error: 'quota' };
    }
  }
  return { ok: true, photos: saved };
};
