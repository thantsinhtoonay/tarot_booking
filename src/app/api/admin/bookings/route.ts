import { NextRequest } from "next/server";
import { fail, ok } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { readDatabase } from "@/lib/db";
import type { BookingStatus } from "@/types";

const statuses = new Set<BookingStatus>(["pending_payment", "confirmed", "completed", "rejected"]);

export async function GET(request: NextRequest) {
  const admin = await requireUser(request, "admin");
  if (!admin) return fail("admin authentication required", 403);
  const params = request.nextUrl.searchParams;
  const status = params.get("status") as BookingStatus | null;
  const date = params.get("date");
  if (status && !statuses.has(status)) return fail("status is invalid");
  if (date && !/^\d{4}-\d{2}-\d{2}$/.test(date)) return fail("date must use YYYY-MM-DD");

  const database = await readDatabase();
  const bookings = database.bookings
    .filter((booking) => !status || booking.status === status)
    .map((booking) => ({
      ...booking,
      customer: database.users.find((user) => user.id === booking.userId)?.name ?? "Unknown customer",
      readingType: database.readingTypes.find((item) => item.id === booking.readingTypeId),
      sessionFormat: database.sessionFormats.find((item) => item.id === booking.sessionFormatId),
      slot: database.slots.find((item) => item.id === booking.slotId),
    }))
    .filter((booking) => !date || booking.slot?.date === date)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return ok(bookings);
}
