import { NextRequest } from "next/server";
import { fail, ok } from "@/lib/api";
import { activeBookingSlotIds, isDateOpen, slotFitsSchedule } from "@/lib/availability";
import { readDatabase } from "@/lib/db";

export async function GET(request: NextRequest) {
  const date = request.nextUrl.searchParams.get("date");
  if (date && !/^\d{4}-\d{2}-\d{2}$/.test(date)) return fail("date must use YYYY-MM-DD");

  const database = await readDatabase();
  if (date && !isDateOpen(database, date)) return ok([]);
  const activeSlotIds = activeBookingSlotIds(database);
  const slots = database.slots
    .filter((slot) => (!date || slot.date === date) && isDateOpen(database, slot.date) && slotFitsSchedule(slot, database.availabilitySettings) && !slot.isBlocked && !slot.isBooked && !activeSlotIds.has(slot.id))
    .sort((a, b) => `${a.date}${a.startTime}`.localeCompare(`${b.date}${b.startTime}`));

  return ok(slots);
}
