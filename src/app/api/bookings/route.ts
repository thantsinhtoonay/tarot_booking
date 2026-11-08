import crypto from "node:crypto";
import { NextRequest } from "next/server";
import { fail, ok, originGuard } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { activeBookingSlotIds, isDateOpen, slotFitsSchedule } from "@/lib/availability";
import { readDatabase, updateDatabase } from "@/lib/db";
import type { ReadingTypeId, SessionFormatId, WalletId } from "@/types";
import { dateValue, facebookLinkValue, jsonBody, stringValue, telegramIdValue, viberNumberValue } from "@/lib/validate";

const wallets = new Set<WalletId>(["kpay", "wavepay", "aya", "cbpay"]);

export async function GET(request: NextRequest) {
  const user = await requireUser(request);
  if (!user) return fail("authentication required", 401);
  const database = await readDatabase();
  return ok(database.bookings.filter((booking) => booking.userId === user.id).sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
}

export async function POST(request: NextRequest) {
  const originError = originGuard(request);
  if (originError) return originError;
  const user = await requireUser(request);
  if (!user) return fail("authentication required", 401);
  try {
    const body = await jsonBody(request);
    const readingTypeId = stringValue(body.readingTypeId, "readingTypeId", true, 80) as ReadingTypeId;
    const sessionFormatId = stringValue(body.sessionFormatId, "sessionFormatId", true, 80) as SessionFormatId;
    const slotId = stringValue(body.slotId, "slotId", true, 120);
    const fullName = stringValue(body.fullName, "fullName", true, 120);
    const dob = dateValue(body.dob, "dob");
    const tob = stringValue(body.tob, "tob", true, 5);
    const questions = stringValue(body.questions, "questions", false, 5_000);
    const viberNumber = viberNumberValue(body.viberNumber);
    const telegramId = telegramIdValue(body.telegramId);
    const facebookLink = facebookLinkValue(body.facebookLink);
    const wallet = body.wallet === undefined ? undefined : stringValue(body.wallet, "wallet", false) as WalletId | undefined;
    const merchantAccountSnapshot = stringValue(body.merchantAccountSnapshot, "merchantAccountSnapshot", false, 300);
    if (wallet && !wallets.has(wallet)) return fail("wallet is not supported");

    const booking = await updateDatabase((database) => {
      const readingType = database.readingTypes.find((item) => item.id === readingTypeId);
      const sessionFormat = database.sessionFormats.find((item) => item.id === sessionFormatId);
      const slot = database.slots.find((item) => item.id === slotId);
      if (!readingType || readingType.isActive === false || !sessionFormat) throw new Error("reading type or session format is invalid");
      if (!slot || !isDateOpen(database, slot.date) || !slotFitsSchedule(slot, database.availabilitySettings) || slot.isBlocked || slot.isBooked || activeBookingSlotIds(database).has(slotId)) throw new Error("selected slot is unavailable");
      const now = new Date().toISOString();
      const created = {
        id: crypto.randomUUID(),
        userId: user.id,
        readingTypeId,
        sessionFormatId,
        slotId,
        fullName,
        dob,
        tob,
        questions,
        viberNumber,
        telegramId,
        facebookLink,
        amount: readingType.price + sessionFormat.priceDelta,
        wallet,
        merchantAccountSnapshot,
        status: "pending_payment" as const,
        createdAt: now,
        updatedAt: now,
      };
      database.bookings.push(created);
      return created;
    });
    return ok(booking, { status: 201 });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "unable to create booking");
  }
}
