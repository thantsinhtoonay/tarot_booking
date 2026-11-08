import { NextRequest } from "next/server";
import { fail, ok } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { listTarotCards } from "@/lib/tarot";

export async function GET(request: NextRequest) {
  const admin = await requireUser(request, "admin");
  if (!admin) return fail("admin authentication required", 403);
  try {
    return ok(await listTarotCards());
  } catch {
    return fail("unable to load the tarot library", 500);
  }
}
