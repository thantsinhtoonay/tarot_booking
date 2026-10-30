import { promises as fs } from "node:fs";
import path from "node:path";
import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";

const contentTypes: Record<string, string> = { png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg", webp: "image/webp" };

export async function GET(request: NextRequest, { params }: { params: Promise<{ filename: string }> }) {
  const user = await requireUser(request);
  if (!user) return NextResponse.json({ ok: false, error: "authentication required" }, { status: 401 });
  const { filename } = await params;
  if (!/^[\w-]+\.(png|jpe?g|webp)$/i.test(filename)) return NextResponse.json({ ok: false, error: "file not found" }, { status: 404 });
  try {
    const file = await fs.readFile(path.join(process.cwd(), ".data", "uploads", filename));
    const extension = filename.split(".").pop()?.toLowerCase() ?? "";
    return new NextResponse(file, { headers: { "Content-Type": contentTypes[extension] ?? "application/octet-stream", "Cache-Control": "private, max-age=3600" } });
  } catch {
    return NextResponse.json({ ok: false, error: "file not found" }, { status: 404 });
  }
}
