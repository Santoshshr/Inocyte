const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
const MEDIA_ORIGIN = API_URL.replace(/\/api\/?$/, '');

/** Resolves a backend-relative media path (e.g. a logo) to an absolute URL. */
export function getMediaUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  if (/^https?:\/\//.test(path)) return path;
  return `${MEDIA_ORIGIN}${path}`;
}
