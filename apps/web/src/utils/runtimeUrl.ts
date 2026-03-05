const LOCAL_API_ORIGIN = 'http://localhost:3000';

function isLocalhostHostname(hostname: string): boolean {
  return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1';
}

/**
 * Returns the API origin to use at runtime.
 * - On localhost: force `http://localhost:3000`
 * - Otherwise: same-origin (empty string)
 */
export function getApiOrigin(): string {
  if (typeof window === 'undefined') return '';
  return isLocalhostHostname(window.location.hostname) ? LOCAL_API_ORIGIN : '';
}

/**
 * Build a URL for hitting the API server.
 * In production this is same-origin (e.g. `/api/...`).
 * On localhost it becomes `http://localhost:3000/api/...`.
 */
export function apiUrl(path: string): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const origin = getApiOrigin();
  return origin ? `${origin}${normalizedPath}` : normalizedPath;
}

/**
 * Resolves media URLs coming from the backend.
 * Backend typically returns paths like `/uploads/...`.
 * On localhost we need to point those to the API server port.
 */
export function resolveMediaUrl(url: string | null | undefined): string | null {
  if (!url) return null;

  if (url.startsWith('data:') || url.startsWith('blob:')) return url;
  if (/^https?:\/\//i.test(url)) return url;

  if (url.startsWith('/uploads/') || url.startsWith('/api/')) {
    return apiUrl(url);
  }

  return url;
}
