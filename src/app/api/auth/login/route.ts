import { NextRequest } from "next/server";
import { fail, ok, withoutPassword } from "@/lib/api";
import { createSessionToken, setSessionCookie, verifyPassword } from "@/lib/auth";
import { readDatabase } from "@/lib/db";
import { emailValue, jsonBody, stringValue } from "@/lib/validate";

export async function POST(request: NextRequest) {
  try {
    const body = await jsonBody(request);
    const email = emailValue(body.email);
    const password = stringValue(body.password, "password");
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
