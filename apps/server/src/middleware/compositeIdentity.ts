import type { NextFunction, Request, Response } from 'express';
import {
  buildCompositeKey,
  getQuota,
  incrementQuota,
  resetQuota,
  type QuotaCategory,
} from '@/services/quotaStore';

// Maps URL fragments to quota categories. Checked via originalUrl.includes().
const CATEGORY_PATTERNS: Array<[string, QuotaCategory]> = [
  ['video-generator', 'video'],
  ['video-repainting', 'video'],
  ['video-extension', 'video'],
  ['image-generator', 'image'],
  ['background-remover', 'image'],
  ['background-replacer', 'image'],
  ['face-crop', 'image'],
  ['object-remover', 'image'],
  ['style-transfer', 'image'],
  ['inpainting', 'image'],
  ['image-upscaler', 'image'],
  ['frame-border', 'image'],
  ['sticker-layer', 'image'],
  ['color-filter', 'image'],
  ['collage-layout', 'image'],
  ['text-overlay', 'image'],
  ['/pipeline/run', 'pipeline'],
];

function detectCategory(originalUrl: string): QuotaCategory {
  const url = originalUrl.toLowerCase();
  for (const [pattern, category] of CATEGORY_PATTERNS) {
    if (url.includes(pattern)) return category;
  }
  return 'text';
}

export function compositeIdentityMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  if (process.env.NODE_ENV === 'development') return next();

  const category = detectCategory(req.originalUrl);
  const fp = (req.headers['x-fp-hash'] as string) ?? '';
  const ip = req.ip ?? req.socket.remoteAddress ?? '';
  const ua = (req.headers['user-agent'] as string) ?? '';
  const lang = (req.headers['accept-language'] as string) ?? '';
  const key = buildCompositeKey(fp, ip, ua, lang);

  // Grace token — reset this identity's quota
  if (req.query['unlock'] && req.query['unlock'] === process.env.GRACE_TOKEN) {
    resetQuota(key);
  }

  const { count, limit, resetAt } = getQuota(key, category);
  if (count >= limit) {
    res.status(429).json({ error: 'daily_limit_reached', category, reset_at: resetAt });
    return;
  }

  incrementQuota(key, category);
  next();
}
