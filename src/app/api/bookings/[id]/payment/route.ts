import { NextRequest } from "next/server";
import { fail, ok } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { updateDatabase } from "@/lib/db";
import { jsonBody, stringValue } from "@/lib/validate";
import type { WalletId } from "@/types";

const wallets = new Set<WalletId>(["kpay", "wavepay", "aya", "cbpay"]);

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser(request);
  if (!user) return fail("authentication required", 401);
  try {
    const { id } = await params;
    const body = await jsonBody(request);
    const transactionId = stringValue(body.transactionId, "transactionId");
    const receiptUrl = stringValue(body.receiptUrl, "receiptUrl", false);
    const wallet = stringValue(body.wallet, "wallet") as WalletId;
    if (!wallets.has(wallet)) return fail("wallet is not supported");

    const result = await updateDatabase((database) => {
      const booking = database.bookings.find((item) => item.id === id && item.userId === user.id);
      if (!booking) throw new Error("booking not found");
      if (booking.status !== "pending_payment") throw new Error("booking is not awaiting payment");
      booking.wallet = wallet;
      booking.transactionId = transactionId;
      booking.receiptUrl = receiptUrl;
      booking.updatedAt = new Date().toISOString();
      const existing = database.paymentVerifications.find((item) => item.bookingId === id);
      if (existing) {
        existing.transactionId = transactionId;
        existing.receiptUrl = receiptUrl;
        existing.decision = "pending";
      } else {
        database.paymentVerifications.push({ bookingId: id, transactionId, receiptUrl, decision: "pending" });
      }
      return booking;
    });
    return ok(result);
  } catch (error) {
    return fail(error instanceof Error ? error.message : "unable to submit payment");
  }
}
