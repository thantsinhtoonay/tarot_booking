import type { AvailabilitySettings, Database, DateRuleStatus, TimeSlot } from "@/types";

export const defaultAvailabilitySettings: AvailabilitySettings = {
  startTime: "09:00",
  endTime: "20:00",
  slotDurationMin: 30,
  defaultOpen: true,
};

export function dateKey(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function timeToMinutes(value: string) {
  const [hours, minutes] = value.split(":").map(Number);
  return hours * 60 + minutes;
}

export function minutesToTime(value: number) {
  return `${String(Math.floor(value / 60)).padStart(2, "0")}:${String(value % 60).padStart(2, "0")}`;
}

export function dateRuleStatus(database: Database, date: string): DateRuleStatus | undefined {
  return database.dateRules.find((rule) => rule.date === date)?.status;
}

export function isDateOpen(database: Database, date: string) {
  if (date < dateKey()) return false;
  const rule = dateRuleStatus(database, date);
  return rule ? rule === "open" : database.availabilitySettings.defaultOpen;
}

export function slotFitsSchedule(slot: TimeSlot, settings: AvailabilitySettings) {
  const start = timeToMinutes(slot.startTime);
  const end = timeToMinutes(slot.endTime);
  const scheduleStart = timeToMinutes(settings.startTime);
  const scheduleEnd = timeToMinutes(settings.endTime);
  return start >= scheduleStart && end <= scheduleEnd && end - start === settings.slotDurationMin && (start - scheduleStart) % settings.slotDurationMin === 0;
}

export function buildSlotsForDate(date: string, settings: AvailabilitySettings): TimeSlot[] {
  const start = timeToMinutes(settings.startTime);
  const end = timeToMinutes(settings.endTime);
  const slots: TimeSlot[] = [];
  for (let cursor = start; cursor + settings.slotDurationMin <= end; cursor += settings.slotDurationMin) {
    const startTime = minutesToTime(cursor);
    const endTime = minutesToTime(cursor + settings.slotDurationMin);
    slots.push({ id: `slot-${date}-${startTime.replace(":", "")}`, date, startTime, endTime, isBooked: false, isBlocked: false });
  }
  return slots;
}

export function ensureAvailability(database: Database, days = 45) {
  const existingIds = new Set(database.slots.map((slot) => slot.id));
  for (let offset = 0; offset < days; offset += 1) {
    const date = new Date();
    date.setHours(12, 0, 0, 0);
    date.setDate(date.getDate() + offset);
    const key = dateKey(date);
    if (!isDateOpen(database, key)) continue;
    for (const slot of buildSlotsForDate(key, database.availabilitySettings)) {
      if (!existingIds.has(slot.id)) {
        database.slots.push(slot);
        existingIds.add(slot.id);
      }
    }
  }
  return database;
}

export function activeBookingSlotIds(database: Database) {
  return new Set(database.bookings.filter((booking) => booking.status !== "rejected").map((booking) => booking.slotId));
}
