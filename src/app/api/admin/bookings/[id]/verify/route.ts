import { NextRequest } from "next/server";
import { fail, ok } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { updateDatabase } from "@/lib/db";
import { jsonBody, stringValue } from "@/lib/validate";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireUser(request, "admin");
  if (!admin) return fail("admin authentication required", 403);
  try {
    const { id } = await params;
    const body = await jsonBody(request);
    const decision = stringValue(body.decision, "decision");
    const adminNote = stringValue(body.adminNote, "adminNote", false);
    if (decision !== "approved" && decision !== "rejected") return fail("decision must be approved or rejected");

    const booking = await updateDatabase((database) => {
      const item = database.bookings.find((booking) => booking.id === id);
      if (!item) throw new Error("booking not found");
      if (item.status !== "pending_payment") throw new Error("booking is not awaiting verification");
      item.status = decision === "approved" ? "confirmed" : "rejected";
      item.adminNote = adminNote;
      item.updatedAt = new Date().toISOString();
      const payment = database.paymentVerifications.find((verification) => verification.bookingId === id);
      if (payment) {
        payment.decision = decision;
        payment.verifiedBy = admin.id;
        payment.verifiedAt = item.updatedAt;
      }
      return item;
    });
    return ok(booking);
  } catch (error) {
    return fail(error instanceof Error ? error.message : "unable to verify booking");
  }
}
