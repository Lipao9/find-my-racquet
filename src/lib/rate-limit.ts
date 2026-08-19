import { sql } from "drizzle-orm";
import { getDb } from "./db";

export interface RateLimitDecision {
  ok: boolean;
  limit: number;
  remaining: number;
  retryAfterSeconds: number;
}

/**
 * Fixed-window rate limiting.
 *
 * /api/recommend spends money on every call, so it must never be callable in an
 * unbounded loop. Two windows are applied: one per IP (stops a single abuser)
 * and one global (bounds the worst-case daily spend even under a distributed
 * flood). The global cap is the one that actually protects the bill.
 *
 * Backed by Postgres when DATABASE_URL is set. Without it, an in-process Map
 * takes over — weaker on serverless, where each instance counts separately, but
 * the alternative is no limit at all on the one endpoint that costs money.
 */
const memory = new Map<string, { windowStart: number; count: number }>();

function checkInMemory(
  key: string,
  limit: number,
  windowSeconds: number,
): RateLimitDecision {
  const now = Date.now();
  const windowMs = windowSeconds * 1000;

  // Opportunistic prune so the Map cannot grow without bound on a long-lived
  // server; cheap because it only runs when the Map is already large.
  if (memory.size > 10_000) {
    for (const [k, v] of memory) {
      if (now - v.windowStart >= windowMs) memory.delete(k);
    }
  }

  const entry = memory.get(key);
  if (!entry || now - entry.windowStart >= windowMs) {
    memory.set(key, { windowStart: now, count: 1 });
    return { ok: true, limit, remaining: limit - 1, retryAfterSeconds: 0 };
  }

  entry.count += 1;
  const elapsed = now - entry.windowStart;
  return {
    ok: entry.count <= limit,
    limit,
    remaining: Math.max(0, limit - entry.count),
    retryAfterSeconds: Math.ceil((windowMs - elapsed) / 1000),
  };
}

export async function checkRateLimit(
  key: string,
  limit: number,
  windowSeconds: number,
): Promise<RateLimitDecision> {
  const db = getDb();
  if (!db) return checkInMemory(key, limit, windowSeconds);

  try {
    // One statement so concurrent requests cannot interleave a read and a
    // write: the counter resets inside the same UPDATE that increments it.
    const rows = await db.execute<{ count: number; window_start: Date }>(sql`
      INSERT INTO rate_limits (key, window_start, count)
      VALUES (${key}, now(), 1)
      ON CONFLICT (key) DO UPDATE SET
        count = CASE
          WHEN rate_limits.window_start < now() - make_interval(secs => ${windowSeconds})
          THEN 1
          ELSE rate_limits.count + 1
        END,
        window_start = CASE
          WHEN rate_limits.window_start < now() - make_interval(secs => ${windowSeconds})
          THEN now()
          ELSE rate_limits.window_start
        END
      RETURNING count, window_start
    `);

    const row = rows[0];
    if (!row) return checkInMemory(key, limit, windowSeconds);

    const count = Number(row.count);
    const elapsedSeconds =
      (Date.now() - new Date(row.window_start).getTime()) / 1000;

    return {
      ok: count <= limit,
      limit,
      remaining: Math.max(0, limit - count),
      retryAfterSeconds: Math.max(0, Math.ceil(windowSeconds - elapsedSeconds)),
    };
  } catch (error) {
    // Fail open rather than 500: a database blip should not take the quiz down.
    // The in-memory window still applies a bound.
    console.error("rate limit check failed, falling back to memory:", error);
    return checkInMemory(key, limit, windowSeconds);
  }
}

function intFromEnv(name: string, fallback: number): number {
  const parsed = Number(process.env[name]);
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : fallback;
}

export const RECOMMEND_LIMITS = {
  perIp: {
    limit: intFromEnv("RATE_LIMIT_PER_IP", 10),
    windowSeconds: intFromEnv("RATE_LIMIT_PER_IP_WINDOW_SECONDS", 3600),
  },
  global: {
    limit: intFromEnv("RATE_LIMIT_GLOBAL", 500),
    windowSeconds: intFromEnv("RATE_LIMIT_GLOBAL_WINDOW_SECONDS", 86_400),
  },
} as const;

/**
 * Vercel sets x-forwarded-for; locally it is absent, so every local request
 * shares the "unknown" bucket. That is fine for a limiter but means local
 * testing hits the per-IP cap quickly.
 */
export function clientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  const first = forwarded?.split(",")[0]?.trim();
  return first || req.headers.get("x-real-ip")?.trim() || "unknown";
}
