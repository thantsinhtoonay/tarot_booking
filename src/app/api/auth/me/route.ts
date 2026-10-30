import { NextRequest } from "next/server";
import { fail, ok, withoutPassword } from "@/lib/api";
import { getSessionUser } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const user = await getSessionUser(request);
  return user ? ok(withoutPassword(user)) : fail("authentication required", 401);
}
