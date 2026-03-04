import Database from 'better-sqlite3';
import { createHash } from 'crypto';
import path from 'path';
import fs from 'fs';

export type QuotaCategory = 'text' | 'image' | 'video' | 'pipeline';

export const QUOTA_LIMITS: Record<QuotaCategory, number> = {
  text: 30,
  image: 5,
  video: 2,
  pipeline: 3,
};

export const COST_PER_CALL: Record<QuotaCategory, number> = {
  text: 0.005,
  image: 0.04,
  video: 0.5,
  pipeline: 1.0,
};

// ─── DB init ─────────────────────────────────────────────────────────────────

const dbDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });

const db = new Database(path.join(dbDir, 'quota.db'));

db.exec(`
  CREATE TABLE IF NOT EXISTS quota_usage (
    composite_key TEXT NOT NULL,
    category      TEXT NOT NULL,
    count         INTEGER NOT NULL DEFAULT 0,
    date          TEXT NOT NULL,
    PRIMARY KEY (composite_key, category)
  );
  CREATE TABLE IF NOT EXISTS budget_spend (
    category TEXT PRIMARY KEY,
    spend    REAL NOT NULL DEFAULT 0,
    date     TEXT NOT NULL
  );
`);

// ─── Helpers ─────────────────────────────────────────────────────────────────

function todayUTC(): string {
  return new Date().toISOString().split('T')[0];
}

function nextMidnightUTC(): string {
  const now = new Date();
  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1),
  ).toISOString();
}

export function buildCompositeKey(
  fpHash: string,
  ip: string,
  userAgent: string,
  acceptLanguage: string,
): string {
  return createHash('sha256')
    .update(`${fpHash}:${ip}:${userAgent}:${acceptLanguage}`)
    .digest('hex');
}

// ─── Quota ───────────────────────────────────────────────────────────────────

const stmtGetQuota = db.prepare<[string, string]>(
  'SELECT count, date FROM quota_usage WHERE composite_key = ? AND category = ?',
);

const stmtUpsertQuota = db.prepare<[string, string, string]>(`
  INSERT INTO quota_usage (composite_key, category, count, date)
  VALUES (?, ?, 1, ?)
  ON CONFLICT(composite_key, category) DO UPDATE SET
    count = CASE WHEN date = excluded.date THEN count + 1 ELSE 1 END,
    date  = excluded.date
`);

const stmtResetQuota = db.prepare<[string]>(
  'DELETE FROM quota_usage WHERE composite_key = ?',
);

export function getQuota(
  key: string,
  category: QuotaCategory,
): { count: number; limit: number; resetAt: string } {
  const today = todayUTC();
  const row = stmtGetQuota.get(key, category) as
    | { count: number; date: string }
    | undefined;
  const count = row && row.date === today ? row.count : 0;
  return { count, limit: QUOTA_LIMITS[category], resetAt: nextMidnightUTC() };
}

export function incrementQuota(key: string, category: QuotaCategory): void {
  stmtUpsertQuota.run(key, category, todayUTC());
}

export function resetQuota(key: string): void {
  stmtResetQuota.run(key);
}

// ─── Budget spend ─────────────────────────────────────────────────────────────

const stmtGetSpend = db.prepare<[string]>(
  'SELECT spend, date FROM budget_spend WHERE category = ?',
);

const stmtUpsertSpend = db.prepare<[string, number, string]>(`
  INSERT INTO budget_spend (category, spend, date)
  VALUES (?, ?, ?)
  ON CONFLICT(category) DO UPDATE SET
    spend = CASE WHEN date = excluded.date THEN spend + excluded.spend ELSE excluded.spend END,
    date  = excluded.date
`);

export function getSpend(category: QuotaCategory): {
  spend: number;
  resetAt: string;
} {
  const today = todayUTC();
  const row = stmtGetSpend.get(category) as
    | { spend: number; date: string }
    | undefined;
  const spend = row && row.date === today ? row.spend : 0;
  return { spend, resetAt: nextMidnightUTC() };
}

export function addSpend(category: QuotaCategory, amount: number): void {
  stmtUpsertSpend.run(category, amount, todayUTC());
}
