import crypto from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";
import { NextRequest } from "next/server";
import { fail, ok, originGuard } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { updateDatabase } from "@/lib/db";

const allowedTypes = new Map([["image/png", ".png"], ["image/jpeg", ".jpg"], ["image/webp", ".webp"]]);
const maxBytes = 5 * 1024 * 1024;

function hasImageSignature(bytes: Buffer, type: string) {
  if (type === "image/png") return bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  if (type === "image/jpeg") return bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  if (type === "image/webp") return bytes.length >= 12 && bytes.subarray(0, 4).toString("ascii") === "RIFF" && bytes.subarray(8, 12).toString("ascii") === "WEBP";
  return false;
}

export async function POST(request: NextRequest) {
  const originError = originGuard(request);
  if (originError) return originError;
  const user = await requireUser(request);
  if (!user) return fail("authentication required", 401);
  try {
    const contentLength = Number(request.headers.get("content-length"));
    if (Number.isFinite(contentLength) && contentLength > maxBytes + 64 * 1024) return fail("upload is too large");
    const form = await request.formData();
    const value = form.get("file");
    if (!(value instanceof File)) return fail("file is required");
    const extension = allowedTypes.get(value.type);
    if (!extension) return fail("only PNG, JPEG, and WebP images are supported");
    if (value.size > maxBytes) return fail("image must be 5MB or smaller");
    const bytes = Buffer.from(await value.arrayBuffer());
    if (!hasImageSignature(bytes, value.type)) return fail("file content does not match its image type");
    const filename = `${crypto.randomUUID()}${extension}`;
    const directory = path.join(process.cwd(), ".data", "uploads");
    await fs.mkdir(directory, { recursive: true });
    await fs.writeFile(path.join(directory, filename), bytes, { flag: "wx" });
    await updateDatabase((database) => {
      database.uploads.push({ filename, userId: user.id, createdAt: new Date().toISOString() });
    });
    return ok({ url: `/api/upload/${filename}`, filename }, { status: 201 });
  } catch {
    return fail("unable to upload file", 500);
  }
}
