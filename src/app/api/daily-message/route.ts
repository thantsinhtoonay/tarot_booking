import { NextRequest } from "next/server";
import { fail, ok } from "@/lib/api";
import { readDatabase } from "@/lib/db";

export async function GET(request: NextRequest) {
  const date = request.nextUrl.searchParams.get("date") || new Date().toISOString().slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return fail("date must use YYYY-MM-DD");
  const database = await readDatabase();
  return ok(database.dailyMessages.find((message) => message.date === date) ?? null);
}
