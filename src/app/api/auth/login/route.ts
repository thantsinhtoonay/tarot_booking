import { NextRequest } from "next/server";
import { fail, ok, originGuard, withoutPassword } from "@/lib/api";
import { createSessionToken, setSessionCookie, verifyPassword } from "@/lib/auth";
import { readDatabase } from "@/lib/db";
import { emailValue, jsonBody, stringValue } from "@/lib/validate";
import { consumeRateLimit, requestAddress } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  const originError = originGuard(request);
  if (originError) return originError;
  const limit = consumeRateLimit(`login:${requestAddress(request)}`, 10, 15 * 60 * 1000);
  if (!limit.allowed) return fail("too many sign-in attempts; try again later", 429, { headers: { "Retry-After": String(limit.retryAfter) } });
  try {
    const body = await jsonBody(request);
    const email = emailValue(body.email);
    const password = stringValue(body.password, "password", true, 128);
    const database = await readDatabase();
    const user = database.users.find((item) => item.email === email);
    if (!user?.passwordHash || !password || !verifyPassword(password, user.passwordHash)) return fail("invalid email or password", 401);

    const response = ok(withoutPassword(user));
    setSessionCookie(response, await createSessionToken(user));
    return response;
  } catch (error) {
    return fail(error instanceof Error ? error.message : "unable to sign in");
  }
}
