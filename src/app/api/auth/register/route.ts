import crypto from "node:crypto";
import { NextRequest } from "next/server";
import { fail, ok, originGuard, withoutPassword } from "@/lib/api";
import { assertAuthConfiguration, createSessionToken, hashPassword, setSessionCookie } from "@/lib/auth";
import { updateDatabase } from "@/lib/db";
import { emailValue, jsonBody, stringValue } from "@/lib/validate";
import { consumeRateLimit, requestAddress } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  const originError = originGuard(request);
  if (originError) return originError;
  const limit = consumeRateLimit(`register:${requestAddress(request)}`, 5, 60 * 60 * 1000);
  if (!limit.allowed) return fail("too many registration attempts; try again later", 429, { headers: { "Retry-After": String(limit.retryAfter) } });
  try {
    assertAuthConfiguration();
    const body = await jsonBody(request);
    const name = stringValue(body.name, "name", true, 120);
    const email = emailValue(body.email);
    const password = stringValue(body.password, "password", true, 128);
    if (!password || password.length < 8) return fail("password must be at least 8 characters");
    const phone = stringValue(body.phone, "phone", false, 32);

    const user = await updateDatabase((database) => {
      if (database.users.some((item) => item.email === email)) throw new Error("email is already registered");
      const created = {
        id: crypto.randomUUID(),
        name,
        email,
        passwordHash: hashPassword(password),
        provider: "email" as const,
        phone,
        role: "customer" as const,
        createdAt: new Date().toISOString(),
      };
      database.users.push(created);
      database.profiles.push({ userId: created.id });
      return created;
    });

    const response = ok(withoutPassword(user), { status: 201 });
    setSessionCookie(response, await createSessionToken(user));
    return response;
  } catch (error) {
    return fail(error instanceof Error ? error.message : "unable to register");
  }
}
