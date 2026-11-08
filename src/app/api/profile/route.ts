import { NextRequest } from "next/server";
import { fail, ok, originGuard, withoutPassword } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { readDatabase, updateDatabase } from "@/lib/db";
import { dateValue, jsonBody, stringValue } from "@/lib/validate";

export async function GET(request: NextRequest) {
  const user = await requireUser(request);
  if (!user) return fail("authentication required", 401);
  const database = await readDatabase();
  return ok({ user: withoutPassword(user), profile: database.profiles.find((profile) => profile.userId === user.id) ?? { userId: user.id } });
}

export async function PATCH(request: NextRequest) {
  const originError = originGuard(request);
  if (originError) return originError;
  const user = await requireUser(request);
  if (!user) return fail("authentication required", 401);
  try {
    const body = await jsonBody(request);
    const name = body.name === undefined ? undefined : stringValue(body.name, "name", true, 120);
    const phone = body.phone === undefined ? undefined : stringValue(body.phone, "phone", false, 32);
    const dob = body.dob === undefined ? undefined : dateValue(body.dob, "dob");
    const tob = body.tob === undefined ? undefined : stringValue(body.tob, "tob", false, 5);
    const bio = body.bio === undefined ? undefined : stringValue(body.bio, "bio", false, 2_000);

    const updated = await updateDatabase((database) => {
      const storedUser = database.users.find((item) => item.id === user.id);
      if (!storedUser) throw new Error("user not found");
      if (name !== undefined) storedUser.name = name;
      if (phone !== undefined) storedUser.phone = phone;
      if (dob !== undefined) storedUser.dob = dob;
      if (tob !== undefined) storedUser.tob = tob;
      let profile = database.profiles.find((item) => item.userId === user.id);
      if (!profile) {
        profile = { userId: user.id };
        database.profiles.push(profile);
      }
      if (bio !== undefined) profile.bio = bio;
      return { user: withoutPassword(storedUser), profile };
    });
    return ok(updated);
  } catch (error) {
    return fail(error instanceof Error ? error.message : "unable to update profile");
  }
}
