import { NextRequest } from "next/server";
import { activeBookingSlotIds } from "@/lib/availability";
import { fail, ok, originGuard } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { readDatabase, updateDatabase } from "@/lib/db";
import type { DateRuleStatus } from "@/types";
import { dateValue, jsonBody, stringValue } from "@/lib/validate";

const dateStatuses = new Set<DateRuleStatus>(["open", "closed"]);

function timeValue(value: unknown, field: string) {
  const time = stringValue(value, field);
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) throw new Error(`${field} must use HH:MM`);
  return time;
}

function durationValue(value: unknown) {
  const duration = typeof value === "number" ? value : Number(value);
  if (!Number.isInteger(duration) || duration < 15 || duration > 240 || duration % 15 !== 0) throw new Error("slotDurationMin must be a 15–240 minute interval");
  return duration;
}

function settingsInput(body: Record<string, unknown>) {
  const startTime = timeValue(body.startTime, "startTime");
  const endTime = timeValue(body.endTime, "endTime");
  const slotDurationMin = durationValue(body.slotDurationMin);
  if (startTime >= endTime) throw new Error("startTime must be before endTime");
  const startMinutes = Number(startTime.slice(0, 2)) * 60 + Number(startTime.slice(3));
  const endMinutes = Number(endTime.slice(0, 2)) * 60 + Number(endTime.slice(3));
  if (endMinutes - startMinutes < slotDurationMin || (endMinutes - startMinutes) % slotDurationMin !== 0) throw new Error("operating hours must fit the slot duration");
  if (typeof body.defaultOpen !== "boolean") throw new Error("defaultOpen must be a boolean");
  return { startTime, endTime, slotDurationMin, defaultOpen: body.defaultOpen };
}

export async function GET(request: NextRequest) {
  const admin = await requireUser(request, "admin");
  if (!admin) return fail("admin authentication required", 403);
  const database = await readDatabase();
  const reservedSlotIds = activeBookingSlotIds(database);
  const slots = database.slots
    .filter((slot) => slot.date >= new Date().toISOString().slice(0, 10))
    .map((slot) => ({ ...slot, isReserved: reservedSlotIds.has(slot.id) }))
    .sort((a, b) => `${a.date}${a.startTime}`.localeCompare(`${b.date}${b.startTime}`));
  return ok({ settings: database.availabilitySettings, dateRules: database.dateRules.sort((a, b) => a.date.localeCompare(b.date)), slots });
}

export async function PUT(request: NextRequest) {
  const originError = originGuard(request);
  if (originError) return originError;
  const admin = await requireUser(request, "admin");
  if (!admin) return fail("admin authentication required", 403);
  try {
    const settings = settingsInput(await jsonBody(request));
    const updated = await updateDatabase((database) => {
      database.availabilitySettings = settings;
      return database.availabilitySettings;
    });
    return ok(updated);
  } catch (error) {
    return fail(error instanceof Error ? error.message : "unable to update availability settings");
  }
}

export async function POST(request: NextRequest) {
  const originError = originGuard(request);
  if (originError) return originError;
  const admin = await requireUser(request, "admin");
  if (!admin) return fail("admin authentication required", 403);
  try {
    const body = await jsonBody(request);
    const action = stringValue(body.action, "action");
    if (action === "dateRule") {
      const date = dateValue(body.date, "date");
      const status = stringValue(body.status, "status") as DateRuleStatus;
      if (!dateStatuses.has(status)) return fail("status must be open or closed");
      const note = stringValue(body.note, "note", false, 300);
      const rule = await updateDatabase((database) => {
        const existing = database.dateRules.find((item) => item.date === date);
        if (existing) {
          existing.status = status;
          existing.note = note;
          existing.updatedAt = new Date().toISOString();
          return existing;
        }
        const created = { date, status, note, updatedAt: new Date().toISOString() };
        database.dateRules.push(created);
        return created;
      });
      return ok(rule);
    }
    if (action === "slot") {
      const slotId = stringValue(body.slotId, "slotId", true, 120);
      const blocked = body.blocked;
      if (typeof blocked !== "boolean") return fail("blocked must be a boolean");
      const slot = await updateDatabase((database) => {
        const existing = database.slots.find((item) => item.id === slotId);
        if (!existing) throw new Error("slot not found");
        if (blocked && activeBookingSlotIds(database).has(slotId)) throw new Error("booked or reserved slots cannot be blocked");
        existing.isBlocked = blocked;
        return existing;
      });
      return ok(slot);
    }
    return fail("unsupported availability action");
  } catch (error) {
    return fail(error instanceof Error ? error.message : "unable to update availability");
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
      const index = database.dateRules.findIndex((item) => item.date === date);
      if (index < 0) throw new Error("date rule not found");
      return database.dateRules.splice(index, 1)[0];
    });
    return ok(removed);
  } catch (error) {
    return fail(error instanceof Error ? error.message : "unable to remove date rule");
  }
}
