import { NextRequest } from "next/server";
import { fail, ok, originGuard } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { readDatabase, updateDatabase } from "@/lib/db";
import type { ReadingType } from "@/types";
import { jsonBody, stringValue } from "@/lib/validate";

function priceValue(value: unknown) {
  const price = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(price) || !Number.isInteger(price) || price <= 0 || price > 100_000_000) throw new Error("price must be a positive whole number up to 100,000,000");
  return price;
}

function serviceId(title: string, existing: ReadingType[]) {
  const base = title.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "service";
  let candidate = base;
  let suffix = 2;
  while (existing.some((item) => item.id === candidate)) {
    candidate = `${base}-${suffix}`;
    suffix += 1;
  }
  return candidate;
}

function serviceInput(body: Record<string, unknown>) {
  return {
    title: stringValue(body.title, "title", true, 120),
    description: stringValue(body.description, "description", true, 1_000),
    price: priceValue(body.price),
  };
}

export async function GET(request: NextRequest) {
  const admin = await requireUser(request, "admin");
  if (!admin) return fail("admin authentication required", 403);
  const database = await readDatabase();
  return ok(database.readingTypes);
}

export async function POST(request: NextRequest) {
  const originError = originGuard(request);
  if (originError) return originError;
  const admin = await requireUser(request, "admin");
  if (!admin) return fail("admin authentication required", 403);
  try {
    const input = serviceInput(await jsonBody(request));
    const created = await updateDatabase((database) => {
      const service: ReadingType = { id: serviceId(input.title, database.readingTypes), ...input };
      database.readingTypes.push(service);
      return service;
    });
    return ok(created, { status: 201 });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "unable to create service");
  }
}

export async function PUT(request: NextRequest) {
  const originError = originGuard(request);
  if (originError) return originError;
  const admin = await requireUser(request, "admin");
  if (!admin) return fail("admin authentication required", 403);
  try {
    const body = await jsonBody(request);
    const id = stringValue(body.id, "id", true, 120);
    const input = serviceInput(body);
    const updated = await updateDatabase((database) => {
      const service = database.readingTypes.find((item) => item.id === id);
      if (!service) throw new Error("service not found");
      Object.assign(service, input);
      return service;
    });
    return ok(updated);
  } catch (error) {
    return fail(error instanceof Error ? error.message : "unable to update service");
  }
}

export async function DELETE(request: NextRequest) {
  const originError = originGuard(request);
  if (originError) return originError;
  const admin = await requireUser(request, "admin");
  if (!admin) return fail("admin authentication required", 403);
  try {
    const id = stringValue(request.nextUrl.searchParams.get("id"), "id", true, 120);
    const removed = await updateDatabase((database) => {
      if (database.bookings.some((booking) => booking.readingTypeId === id)) {
        throw new Error("service cannot be deleted because it has existing bookings");
      }
      const index = database.readingTypes.findIndex((item) => item.id === id);
      if (index < 0) throw new Error("service not found");
      if (database.readingTypes.length === 1) throw new Error("at least one service must remain");
      return database.readingTypes.splice(index, 1)[0];
    });
    return ok(removed);
  } catch (error) {
    return fail(error instanceof Error ? error.message : "unable to delete service");
  }
}
