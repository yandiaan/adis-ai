import type { NextFunction, Request, Response } from 'express';

const MIN_SESSION_AGE_MS = 1500;

export function requestTimingGate(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  if (process.env.NODE_ENV === 'development') return next();

  const raw = req.headers['x-session-start'];
  if (!raw) {
    res.status(429).json({ error: 'request_too_early' });
    return;
  }

  const sessionStartMs = parseInt(raw as string, 10);
  if (isNaN(sessionStartMs) || Date.now() - sessionStartMs < MIN_SESSION_AGE_MS) {
    res.status(429).json({ error: 'request_too_early' });
    return;
  }

  next();
}
