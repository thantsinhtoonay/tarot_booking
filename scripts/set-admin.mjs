import crypto from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";

const [rawEmail, password] = process.argv.slice(2);
const email = rawEmail?.trim().toLowerCase();

if (!email || !password) {
  console.error("Usage: npm run admin:set -- <email> <password>");
  process.exit(1);
}

if (password.length < 8) {
  console.error("Admin password must be at least 8 characters.");
  process.exit(1);
}

const dbPath = path.join(process.cwd(), ".data", "db.json");

function hashPassword(value) {
  const salt = crypto.randomBytes(16).toString("hex");
  const derivedKey = crypto.scryptSync(value, salt, 64).toString("hex");
  return `${salt}:${derivedKey}`;
}

function seedSlots() {
  const slots = [];
  for (let day = 0; day < 21; day += 1) {
    const date = new Date();
    date.setDate(date.getDate() + day);
    const dateValue = date.toISOString().slice(0, 10);
    for (const [startTime, endTime] of [["10:00", "10:30"], ["13:00", "13:30"], ["16:00", "16:30"]]) {
      slots.push({ id: `slot-${dateValue}-${startTime.replace(":", "")}`, date: dateValue, startTime, endTime, isBooked: false });
    }
  }
  return slots;
}

function emptyDatabase() {
  return {
    users: [],
    readingTypes: [
      { id: "love", title: "Love Reading", description: "Clarity for relationships and matters of the heart.", price: 15000 },
      { id: "career", title: "Career Reading", description: "Guidance for work, direction, and opportunity.", price: 15000 },
      { id: "overall", title: "Overall Life Reading", description: "A broad reading for your current path and energy.", price: 18000 },
      { id: "custom", title: "Custom Question", description: "Bring one focused question for a personal reading.", price: 12000 },
    ],
    sessionFormats: [
      { id: "written", title: "Written Report", priceDelta: 0, durationMin: 30 },
      { id: "voice", title: "Live Voice Call", priceDelta: 5000, durationMin: 30 },
      { id: "video", title: "Live Video Call", priceDelta: 10000, durationMin: 45 },
    ],
    slots: seedSlots(),
    bookings: [],
    paymentVerifications: [],
    dailyMessages: [],
    profiles: [],
  };
}

await fs.mkdir(path.dirname(dbPath), { recursive: true });

let database;
try {
  database = JSON.parse(await fs.readFile(dbPath, "utf8"));
} catch (error) {
  if (error.code !== "ENOENT") throw error;
  database = emptyDatabase();
}

const now = new Date().toISOString();
const existing = database.users.find((user) => user.email === email);

if (existing) {
  existing.role = "admin";
  existing.provider = "email";
  existing.passwordHash = hashPassword(password);
  existing.name = existing.name || "Bhone Thaw Admin";
} else {
  database.users.push({
    id: crypto.randomUUID(),
    name: "Bhone Thaw Admin",
    email,
    passwordHash: hashPassword(password),
    provider: "email",
    role: "admin",
    createdAt: now,
  });
}

await fs.writeFile(dbPath, JSON.stringify(database, null, 2), "utf8");
console.log(`Admin account ready: ${email}`);
