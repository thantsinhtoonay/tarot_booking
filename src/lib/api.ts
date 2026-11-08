import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function ok<T>(data: T, init?: ResponseInit) {
  return NextResponse.json({ ok: true, data }, init);
}

export function fail(error: string, status = 400, init?: ResponseInit) {
  return NextResponse.json({ ok: false, error }, { ...init, status });
}

export function sameOrigin(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  try {
    const allowedOrigins = new Set([request.nextUrl.origin]);
    if (process.env.NEXT_PUBLIC_APP_URL) allowedOrigins.add(new URL(process.env.NEXT_PUBLIC_APP_URL).origin);
    return allowedOrigins.has(new URL(origin).origin);
  } catch {
    return false;
  }
}

export function originGuard(request: NextRequest) {
  return sameOrigin(request) ? null : fail("request origin is not allowed", 403);
}

export function withoutPassword<T extends { passwordHash?: string }>(user: T) {
  const safeUser = { ...user };
  delete safeUser.passwordHash;
  return safeUser;
}
