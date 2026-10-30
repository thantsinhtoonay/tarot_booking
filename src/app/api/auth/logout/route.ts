import { NextResponse } from "next/server";
import { clearSessionCookie } from "@/lib/auth";

export function POST() {
  const response = NextResponse.json({ ok: true, data: null });
  clearSessionCookie(response);
  return response;
}
