import type { NextFunction, Request, Response } from 'express';
import { getSpend, addSpend, COST_PER_CALL, type QuotaCategory } from '@/services/quotaStore';

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

function getDailyBudget(category: QuotaCategory): number {
  const envMap: Record<QuotaCategory, string> = {
    text: 'DAILY_BUDGET_TEXT',
    image: 'DAILY_BUDGET_IMAGE',
    video: 'DAILY_BUDGET_VIDEO',
    pipeline: 'DAILY_BUDGET_PIPELINE',
  };
  const defaults: Record<QuotaCategory, number> = {
    text: 1.0,
    image: 2.0,
    video: 2.0,
    pipeline: 2.0,
  };
  const val = parseFloat(process.env[envMap[category]] ?? '');
  return isNaN(val) ? defaults[category] : val;
}

export function budgetCircuitBreaker(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  if (process.env.NODE_ENV === 'development') return next();

  const category = detectCategory(req.originalUrl);
  const budget = getDailyBudget(category);
  const { spend, resetAt } = getSpend(category);

  if (spend >= budget) {
    res
      .status(503)
      .json({ error: 'daily_budget_exhausted', category, reset_at: resetAt });
    return;
  }

  addSpend(category, COST_PER_CALL[category]);
  next();
}
