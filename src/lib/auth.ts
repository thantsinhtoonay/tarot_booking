import crypto from "node:crypto";
import { jwtVerify, SignJWT } from "jose";
import type { NextRequest, NextResponse } from "next/server";
import { readDatabase } from "@/lib/db";
import type { User, UserRole } from "@/types";

export const SESSION_COOKIE = "btt_session";

function secretKey() {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) throw new Error("JWT_SECRET must be configured with at least 32 characters");
  return new TextEncoder().encode(secret);
}

export function assertAuthConfiguration() {
  secretKey();
}

export function hashPassword(password: string) {
  const salt = crypto.randomBytes(16).toString("hex");
  const derivedKey = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${derivedKey}`;
}

export function verifyPassword(password: string, storedHash: string) {
  const [salt, expected] = storedHash.split(":");
  if (!salt || !expected) return false;
  const actual = crypto.scryptSync(password, salt, 64).toString("hex");
  const expectedBuffer = Buffer.from(expected, "hex");
  const actualBuffer = Buffer.from(actual, "hex");
  return expectedBuffer.length === actualBuffer.length && crypto.timingSafeEqual(actualBuffer, expectedBuffer);
}

export async function createSessionToken(user: Pick<User, "id" | "role">) {
  return new SignJWT({ role: user.role })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secretKey());
}

export function setSessionCookie(response: NextResponse, token: string) {
  response.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export function clearSessionCookie(response: NextResponse) {
  response.cookies.set(SESSION_COOKIE, "", { httpOnly: true, expires: new Date(0), path: "/" });
}

export async function getSessionUser(request: NextRequest): Promise<User | null> {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secretKey());
    if (typeof payload.sub !== "string") return null;
    const database = await readDatabase();
    return database.users.find((user) => user.id === payload.sub) ?? null;
  } catch {
    return null;
  }
}

export async function requireUser(request: NextRequest, role?: UserRole) {
  const user = await getSessionUser(request);
  if (!user || (role && user.role !== role)) return null;
  return user;
}
