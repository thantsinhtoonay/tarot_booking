import crypto from "node:crypto";
import { NextRequest } from "next/server";
import { fail, ok, originGuard } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { updateDatabase } from "@/lib/db";
import { listTarotCards } from "@/lib/tarot";
import { dateValue, jsonBody, stringValue } from "@/lib/validate";

export async function POST(request: NextRequest) {
  const originError = originGuard(request);
  if (originError) return originError;
  const admin = await requireUser(request, "admin");
  if (!admin) return fail("admin authentication required", 403);
  try {
    const body = await jsonBody(request);
    const date = dateValue(body.date, "date");
    const adviceText = stringValue(body.adviceText, "adviceText", true, 5_000);
    const cardName = stringValue(body.cardName, "cardName", false, 120);
    const cardImage = stringValue(body.cardImage, "cardImage", false, 300);
    const keywords = Array.isArray(body.keywords) ? body.keywords.slice(0, 8).map((item) => stringValue(item, "keyword", true, 40)) : undefined;
    if (cardImage) {
      const tarotCards = await listTarotCards();
      if (!tarotCards.some((card) => card.url === cardImage)) throw new Error("cardImage must be selected from the bundled tarot library");
    }

    const message = await updateDatabase((database) => {
      const now = new Date().toISOString();
      const existing = database.dailyMessages.find((item) => item.date === date);
      if (existing) {
        existing.cardName = cardName;
        existing.cardImage = cardImage;
        existing.keywords = keywords;
        existing.adviceText = adviceText;
        existing.publishedBy = admin.id;
        existing.updatedAt = now;
        return existing;
      }
      const created = { id: crypto.randomUUID(), date, cardName, cardImage, keywords, adviceText, publishedBy: admin.id, updatedAt: now };
      database.dailyMessages.push(created);
      return created;
    });
    return ok(message);
  } catch (error) {
    return fail(error instanceof Error ? error.message : "unable to publish daily message");
  }
}

export async function DELETE(request: NextRequest) {
  const originError = originGuard(request);
  if (originError) return originError;
  const admin = await requireUser(request, "admin");
  if (!admin) return fail("admin authentication required", 403);
  try {
    const date = dateValue(request.nextUrl.searchParams.get("date"), "date");
    const removed = await updateDatabase((database) => {
      const index = database.dailyMessages.findIndex((item) => item.date === date);
      if (index < 0) throw new Error("daily message not found");
      return database.dailyMessages.splice(index, 1)[0];
    });
    return ok(removed);
  } catch (error) {
    return fail(error instanceof Error ? error.message : "unable to delete daily message");
  }
}
