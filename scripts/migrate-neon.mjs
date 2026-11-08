import { promises as fs } from "node:fs";
import path from "node:path";
import { neon } from "@neondatabase/serverless";

const databaseUrl = process.env.DATABASE_URL?.trim();
if (!databaseUrl) {
  throw new Error("DATABASE_URL is required to migrate the local JSON database.");
}

const filePath = path.join(process.cwd(), ".data", "db.json");
let data;

try {
  data = JSON.parse(await fs.readFile(filePath, "utf8"));
} catch (error) {
  if (error?.code === "ENOENT") {
    console.log("No local .data/db.json found; Neon remains ready for a fresh database.");
    process.exit(0);
  }
  throw error;
}

const sql = neon(databaseUrl);
await sql`
  CREATE TABLE IF NOT EXISTS app_state (
    id integer PRIMARY KEY CHECK (id = 1),
    data jsonb NOT NULL,
    updated_at timestamptz NOT NULL DEFAULT now()
  )
`;

const rows = await sql`SELECT id FROM app_state WHERE id = 1 LIMIT 1`;
if (rows.length > 0) {
  console.log("Neon already contains app state; no data was overwritten.");
  process.exit(0);
}

await sql`
  INSERT INTO app_state (id, data, updated_at)
  VALUES (1, ${JSON.stringify(data)}::jsonb, now())
`;

console.log("Migrated .data/db.json into Neon app_state.");
