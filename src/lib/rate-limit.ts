import type { NextRequest } from "next/server";

type RateLimitEntry = { count: number; resetAt: number };

const entries = new Map<string, RateLimitEntry>();

export function requestAddress(request: NextRequest) {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || request.headers.get("x-real-ip") || "unknown";
}

export function consumeRateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const current = entries.get(key);
  if (!current || current.resetAt <= now) {
    entries.set(key, { count: 1, resetAt: now + windowMs });
    if (entries.size > 5_000) {
      for (const [entryKey, entry] of entries) if (entry.resetAt <= now) entries.delete(entryKey);
    }
    return { allowed: true, retryAfter: Math.ceil(windowMs / 1000) };
  }
  if (current.count >= limit) return { allowed: false, retryAfter: Math.max(1, Math.ceil((current.resetAt - now) / 1000)) };
  current.count += 1;
  return { allowed: true, retryAfter: Math.max(1, Math.ceil((current.resetAt - now) / 1000)) };
}
