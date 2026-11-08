import { promises as fs } from "node:fs";
import path from "node:path";
import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { readDatabase } from "@/lib/db";

const contentTypes: Record<string, string> = { png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg", webp: "image/webp" };

export async function GET(request: NextRequest, { params }: { params: Promise<{ filename: string }> }) {
  const user = await requireUser(request);
  if (!user) return NextResponse.json({ ok: false, error: "authentication required" }, { status: 401 });
  const { filename } = await params;
  if (!/^[\w-]+\.(png|jpe?g|webp)$/i.test(filename)) return NextResponse.json({ ok: false, error: "file not found" }, { status: 404 });
  try {
    const database = await readDatabase();
    const url = `/api/upload/${filename}`;
    const upload = database.uploads.find((item) => item.filename === filename);
    const ownsUpload = upload?.userId === user.id || database.bookings.some((booking) => booking.userId === user.id && booking.receiptUrl === url);
    const adminCanViewLegacyUpload = user.role === "admin" && database.bookings.some((booking) => booking.receiptUrl === url);
    if (user.role !== "admin" && !ownsUpload || user.role === "admin" && !upload && !adminCanViewLegacyUpload) return NextResponse.json({ ok: false, error: "file not found" }, { status: 404 });
    const file = await fs.readFile(path.join(process.cwd(), ".data", "uploads", filename));
    const extension = filename.split(".").pop()?.toLowerCase() ?? "";
    return new NextResponse(file, { headers: { "Content-Type": contentTypes[extension] ?? "application/octet-stream", "Content-Disposition": `inline; filename="${filename}"`, "Cache-Control": "private, max-age=3600", "Content-Security-Policy": "default-src 'none'; sandbox", "Referrer-Policy": "no-referrer", "X-Content-Type-Options": "nosniff" } });
  } catch {
    return NextResponse.json({ ok: false, error: "file not found" }, { status: 404 });
  }
}
