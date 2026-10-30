import { NextResponse } from "next/server";

export function ok<T>(data: T, init?: ResponseInit) {
  return NextResponse.json({ ok: true, data }, init);
}

export function fail(error: string, status = 400) {
  return NextResponse.json({ ok: false, error }, { status });
}

export function withoutPassword<T extends { passwordHash?: string }>(user: T) {
  const safeUser = { ...user };
  delete safeUser.passwordHash;
  return safeUser;
}
