import { promises as fs } from "node:fs";
import path from "node:path";
import { Pool } from "@neondatabase/serverless";
import { defaultAvailabilitySettings, ensureAvailability } from "@/lib/availability";
import type { AvailabilitySettings, Database, DateRule, ReadingType, SessionFormat, TimeSlot, UploadRecord } from "@/types";

const dbPath = path.join(process.cwd(), ".data", "db.json");
const postgresStateId = 1;
const postgresLockKey = 738421;

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

function hasPostgresDatabase() {
  return Boolean(process.env.DATABASE_URL?.trim());
}

let postgresPool: Pool | undefined;

function getPostgresPool() {
  if (!hasPostgresDatabase()) {
    throw new Error("DATABASE_URL is not configured");
  }

  postgresPool ??= new Pool({ connectionString: process.env.DATABASE_URL });
  return postgresPool;
}

async function ensurePostgresSchema(pool: Pool) {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS app_state (
      id integer PRIMARY KEY CHECK (id = 1),
      data jsonb NOT NULL,
      updated_at timestamptz NOT NULL DEFAULT now()
    )
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS upload_blobs (
      filename text PRIMARY KEY,
      user_id text NOT NULL,
      content_type text NOT NULL,
      data bytea NOT NULL,
      created_at timestamptz NOT NULL DEFAULT now()
    )
  `);
}

function parsePostgresState(value: unknown) {
  if (!value || typeof value !== "object") {
    return emptyDatabase();
  }

  return normalizeDatabase(value as Partial<Database>);
}

async function readPostgresDatabase(): Promise<Database> {
  const pool = getPostgresPool();
  await ensurePostgresSchema(pool);

  const result = await pool.query<{ data: unknown }>(
    "SELECT data FROM app_state WHERE id = $1 LIMIT 1",
    [postgresStateId],
  );

  if (!result.rows[0]) {
    const database = emptyDatabase();
    await pool.query(
      `INSERT INTO app_state (id, data) VALUES ($1, $2::jsonb) ON CONFLICT (id) DO NOTHING`,
      [postgresStateId, JSON.stringify(database)],
    );
    return database;
  }

  return parsePostgresState(result.rows[0].data);
}

async function writePostgresDatabase(pool: Pool, database: Database) {
  await pool.query(
    `
      INSERT INTO app_state (id, data, updated_at)
      VALUES ($1, $2::jsonb, now())
      ON CONFLICT (id)
      DO UPDATE SET data = EXCLUDED.data, updated_at = now()
    `,
    [postgresStateId, JSON.stringify(ensureAvailability(database))],
  );
}

async function updatePostgresDatabase<T>(mutator: (database: Database) => T | Promise<T>): Promise<T> {
  const pool = getPostgresPool();
  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    await client.query(`
      CREATE TABLE IF NOT EXISTS app_state (
        id integer PRIMARY KEY CHECK (id = 1),
        data jsonb NOT NULL,
        updated_at timestamptz NOT NULL DEFAULT now()
      )
    `);
    await client.query(`
      CREATE TABLE IF NOT EXISTS upload_blobs (
        filename text PRIMARY KEY,
        user_id text NOT NULL,
        content_type text NOT NULL,
        data bytea NOT NULL,
        created_at timestamptz NOT NULL DEFAULT now()
      )
    `);
    await client.query("SELECT pg_advisory_xact_lock($1)", [postgresLockKey]);

    const result = await client.query<{ data: unknown }>(
      "SELECT data FROM app_state WHERE id = $1 LIMIT 1",
      [postgresStateId],
    );
    const database = result.rows[0] ? parsePostgresState(result.rows[0].data) : emptyDatabase();
    const value = await mutator(database);

    await client.query(
      `
        INSERT INTO app_state (id, data, updated_at)
        VALUES ($1, $2::jsonb, now())
        ON CONFLICT (id)
        DO UPDATE SET data = EXCLUDED.data, updated_at = now()
      `,
      [postgresStateId, JSON.stringify(ensureAvailability(database))],
    );
    await client.query("COMMIT");
    return value;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export function usesPostgresStorage() {
  return hasPostgresDatabase();
}

export async function saveUploadBlob(input: {
  filename: string;
  userId: string;
  contentType: string;
  data: Buffer;
}) {
  const pool = getPostgresPool();
  await ensurePostgresSchema(pool);
  await pool.query(
    `
      INSERT INTO upload_blobs (filename, user_id, content_type, data)
      VALUES ($1, $2, $3, $4)
    `,
    [input.filename, input.userId, input.contentType, input.data],
  );
}

export async function readUploadBlob(filename: string) {
  const pool = getPostgresPool();
  await ensurePostgresSchema(pool);
  const result = await pool.query<{ content_type: string; data: Buffer }>(
    "SELECT content_type, data FROM upload_blobs WHERE filename = $1 LIMIT 1",
    [filename],
  );
  return result.rows[0] ?? null;
}

export async function readDatabase(): Promise<Database> {
  if (hasPostgresDatabase()) {
    return readPostgresDatabase();
  }

  await ensureDatabase();
  return normalizeDatabase(JSON.parse(await fs.readFile(dbPath, "utf8")) as Partial<Database>);
}

export async function writeDatabase(database: Database) {
  if (hasPostgresDatabase()) {
    await writePostgresDatabase(getPostgresPool(), database);
    return;
  }

  await ensureDatabase();
  await fs.writeFile(dbPath, JSON.stringify(ensureAvailability(database), null, 2), "utf8");
}

let databaseQueue: Promise<void> = Promise.resolve();

export function updateDatabase<T>(mutator: (database: Database) => T | Promise<T>): Promise<T> {
  if (hasPostgresDatabase()) {
    return updatePostgresDatabase(mutator);
  }

  const operation = databaseQueue.then(async () => {
    const database = await readDatabase();
    const result = await mutator(database);
    await writeDatabase(database);
    return result;
  });
  databaseQueue = operation.then(() => undefined, () => undefined);
  return operation;
}
