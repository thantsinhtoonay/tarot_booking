import { NextRequest } from "next/server";
import { originGuard } from "@/lib/api";
import { NextResponse } from "next/server";
import { clearSessionCookie } from "@/lib/auth";

export function POST(request: NextRequest) {
  const originError = originGuard(request);
  if (originError) return originError;
  const response = NextResponse.json({ ok: true, data: null });
  clearSessionCookie(response);
  return response;
}
