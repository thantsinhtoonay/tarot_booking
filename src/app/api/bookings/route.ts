import crypto from "node:crypto";
import { NextRequest } from "next/server";
import { fail, ok } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { readDatabase, updateDatabase } from "@/lib/db";
import type { ReadingTypeId, SessionFormatId, WalletId } from "@/types";
import { dateValue, jsonBody, stringValue } from "@/lib/validate";

const wallets = new Set<WalletId>(["kpay", "wavepay", "aya", "cbpay"]);

export async function GET(request: NextRequest) {
  const user = await requireUser(request);
  if (!user) return fail("authentication required", 401);
  const database = await readDatabase();
  return ok(database.bookings.filter((booking) => booking.userId === user.id).sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
}

export async function POST(request: NextRequest) {
  const user = await requireUser(request);
  if (!user) return fail("authentication required", 401);
  try {
    const body = await jsonBody(request);
    const readingTypeId = stringValue(body.readingTypeId, "readingTypeId") as ReadingTypeId;
    const sessionFormatId = stringValue(body.sessionFormatId, "sessionFormatId") as SessionFormatId;
    const slotId = stringValue(body.slotId, "slotId");
    const fullName = stringValue(body.fullName, "fullName");
    const dob = dateValue(body.dob, "dob");
    const tob = stringValue(body.tob, "tob");
    const questions = stringValue(body.questions, "questions", false);
    const wallet = body.wallet === undefined ? undefined : stringValue(body.wallet, "wallet", false) as WalletId | undefined;
    if (wallet && !wallets.has(wallet)) return fail("wallet is not supported");

    const booking = await updateDatabase((database) => {
      const readingType = database.readingTypes.find((item) => item.id === readingTypeId);
      const sessionFormat = database.sessionFormats.find((item) => item.id === sessionFormatId);
      const slot = database.slots.find((item) => item.id === slotId);
      if (!readingType || !sessionFormat) throw new Error("reading type or session format is invalid");
      if (!slot || slot.isBooked) throw new Error("selected slot is unavailable");
      if (database.bookings.some((item) => item.slotId === slotId && item.status !== "rejected")) throw new Error("selected slot is unavailable");
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
        amount: readingType.price + sessionFormat.priceDelta,
        wallet,
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
