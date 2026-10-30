import crypto from "node:crypto";
import { NextRequest } from "next/server";
import { fail, ok } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { updateDatabase } from "@/lib/db";
import { dateValue, jsonBody, stringValue } from "@/lib/validate";

export async function POST(request: NextRequest) {
  const admin = await requireUser(request, "admin");
  if (!admin) return fail("admin authentication required", 403);
  try {
    const body = await jsonBody(request);
    const date = dateValue(body.date, "date");
    const adviceText = stringValue(body.adviceText, "adviceText");
    const cardName = stringValue(body.cardName, "cardName", false);
    const cardImage = stringValue(body.cardImage, "cardImage", false);
    const keywords = Array.isArray(body.keywords) ? body.keywords.filter((item): item is string => typeof item === "string") : undefined;

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
