import { NextRequest } from "next/server";
import { fail, ok } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { readDatabase } from "@/lib/db";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser(request);
  if (!user) return fail("authentication required", 401);
  const { id } = await params;
  const database = await readDatabase();
  const booking = database.bookings.find((item) => item.id === id && item.userId === user.id);
  return booking ? ok(booking) : fail("booking not found", 404);
}
