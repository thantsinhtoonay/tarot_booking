import crypto from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";
import { NextRequest } from "next/server";
import { fail, ok } from "@/lib/api";
import { requireUser } from "@/lib/auth";

const allowedTypes = new Map([["image/png", ".png"], ["image/jpeg", ".jpg"], ["image/webp", ".webp"]]);
const maxBytes = 5 * 1024 * 1024;

export async function POST(request: NextRequest) {
  const user = await requireUser(request);
  if (!user) return fail("authentication required", 401);
  try {
    const form = await request.formData();
    const value = form.get("file");
    if (!(value instanceof File)) return fail("file is required");
    const extension = allowedTypes.get(value.type);
    if (!extension) return fail("only PNG, JPEG, and WebP images are supported");
    if (value.size > maxBytes) return fail("image must be 5MB or smaller");
    const filename = `${crypto.randomUUID()}${extension}`;
    const directory = path.join(process.cwd(), ".data", "uploads");
    await fs.mkdir(directory, { recursive: true });
    await fs.writeFile(path.join(directory, filename), Buffer.from(await value.arrayBuffer()));
    return ok({ url: `/api/upload/${filename}`, filename }, { status: 201 });
  } catch {
    return fail("unable to upload file", 500);
  }
}
