import { promises as fs } from "node:fs";
import path from "node:path";
import type { Database, ReadingType, SessionFormat, TimeSlot } from "@/types";

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

function formatDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function seedSlots(): TimeSlot[] {
  const slots: TimeSlot[] = [];
  for (let day = 0; day < 21; day += 1) {
    const date = new Date();
    date.setDate(date.getDate() + day);
    const dateValue = formatDate(date);
    for (const [startTime, endTime] of [["10:00", "10:30"], ["13:00", "13:30"], ["16:00", "16:30"]]) {
      slots.push({ id: `slot-${dateValue}-${startTime.replace(":", "")}`, date: dateValue, startTime, endTime, isBooked: false });
    }
  }
  return slots;
}

function emptyDatabase(): Database {
  return {
    users: [],
    readingTypes,
    sessionFormats,
    slots: seedSlots(),
    bookings: [],
    paymentVerifications: [],
    dailyMessages: [],
    profiles: [],
  };
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
  return JSON.parse(await fs.readFile(dbPath, "utf8")) as Database;
}

export async function writeDatabase(database: Database) {
  await ensureDatabase();
  await fs.writeFile(dbPath, JSON.stringify(database, null, 2), "utf8");
}

export async function updateDatabase<T>(mutator: (database: Database) => T | Promise<T>): Promise<T> {
  const database = await readDatabase();
  const result = await mutator(database);
  await writeDatabase(database);
  return result;
}
