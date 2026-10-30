import { ok } from "@/lib/api";

export function GET() {
  return ok({ service: "bhone-thaw-tarot-api", status: "ok", timestamp: new Date().toISOString() });
}
