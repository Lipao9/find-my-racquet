import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

export type Database = ReturnType<typeof drizzle<typeof schema>>;

/**
 * The database is optional. Analytics and rate-limit counters are useful but
 * not on the critical path, so with no DATABASE_URL the app runs exactly as it
 * did before Phase 2 — `npm run dev` needs no local Postgres.
 *
 * postgres.js (TCP) rather than Neon's HTTP driver so the same code runs
 * against a local Postgres in tests and CI. On Vercel, point DATABASE_URL at
 * Neon's *pooled* endpoint (the `-pooler` host): serverless invocations would
 * otherwise exhaust direct connections.
 */
let cached: Database | null | undefined;

export function getDb(): Database | null {
  if (cached !== undefined) return cached;

  const url = process.env.DATABASE_URL?.trim();
  if (!url) {
    cached = null;
    return cached;
  }

  // max: 1 — each serverless invocation is short-lived and gets its own
  // client; pooling happens on Neon's side, not in the function.
  const client = postgres(url, { max: 1, prepare: false });
  cached = drizzle(client, { schema });
  return cached;
}

export function isDbConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL?.trim());
}
