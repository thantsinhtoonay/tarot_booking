import { ok } from "@/lib/api";
import { readDatabase } from "@/lib/db";

export async function GET() {
  const database = await readDatabase();
  return ok({ readingTypes: database.readingTypes.filter((item) => item.isActive !== false), sessionFormats: database.sessionFormats });
}
