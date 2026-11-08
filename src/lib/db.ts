import { promises as fs } from "node:fs";
import path from "node:path";
import { defaultAvailabilitySettings, ensureAvailability } from "@/lib/availability";
import type { AvailabilitySettings, Database, DateRule, ReadingType, SessionFormat, TimeSlot, UploadRecord } from "@/types";

const dbPath = path.join(process.cwd(), ".data", "db.json");

const readingTypes: ReadingType[] = [
  { id: "love", title: "Love Reading", description: "Clarity for relationships and matters of the heart.", price: 15000 },
  { id: "career", title: "Career Reading", description: "Guidance for work, direction, and opportunity.", price: 15000 },
  { id: "overall", title: "Overall Life Reading", description: "A broad reading for your current path and energy.", price: 18000 },
  { id: "custom", title: "Custom Question", description: "Bring one focused question for a personal reading.", price: 12000 },
];

const sessionFormats: SessionFormat[] = [
  { id: "written", title: "Written Report", priceDelta: 0, durationMin: 30 },
  { id: "voice", title: "Live Voice Call", priceDelta: 5000, durationMin: 30 },
  { id: "video", title: "Live Video Call", priceDelta: 10000, durationMin: 45 },
];

function emptyDatabase(): Database {
  const database: Database = {
    users: [],
    readingTypes,
    sessionFormats,
    slots: [],
    availabilitySettings: { ...defaultAvailabilitySettings },
    dateRules: [],
    bookings: [],
    paymentVerifications: [],
    uploads: [],
    dailyMessages: [],
    profiles: [],
  };
  return ensureAvailability(database);
}

function normalizeDatabase(value: Partial<Database>): Database {
  const fallback = emptyDatabase();
  const database: Database = {
    ...fallback,
    ...value,
    availabilitySettings: { ...defaultAvailabilitySettings, ...(value.availabilitySettings as Partial<AvailabilitySettings> | undefined) },
    dateRules: Array.isArray(value.dateRules) ? value.dateRules as DateRule[] : [],
    slots: Array.isArray(value.slots) ? (value.slots as TimeSlot[]).map((slot) => ({ ...slot, isBlocked: Boolean(slot.isBlocked) })) : [],
    uploads: Array.isArray(value.uploads) ? value.uploads as UploadRecord[] : [],
  };
  return ensureAvailability(database);
}

async function ensureDatabase() {
  await fs.mkdir(path.dirname(dbPath), { recursive: true });
  try {
    await fs.access(dbPath);
  } catch {
    await fs.writeFile(dbPath, JSON.stringify(emptyDatabase(), null, 2), "utf8");
  }
}

export async function readDatabase(): Promise<Database> {
  await ensureDatabase();
  return normalizeDatabase(JSON.parse(await fs.readFile(dbPath, "utf8")) as Partial<Database>);
}

export async function writeDatabase(database: Database) {
  await ensureDatabase();
  await fs.writeFile(dbPath, JSON.stringify(ensureAvailability(database), null, 2), "utf8");
}

let databaseQueue: Promise<void> = Promise.resolve();

export function updateDatabase<T>(mutator: (database: Database) => T | Promise<T>): Promise<T> {
  const operation = databaseQueue.then(async () => {
    const database = await readDatabase();
    const result = await mutator(database);
    await writeDatabase(database);
    return result;
  });
  databaseQueue = operation.then(() => undefined, () => undefined);
  return operation;
}
