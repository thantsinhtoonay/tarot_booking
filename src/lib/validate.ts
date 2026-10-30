export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function stringValue(value: unknown, field: string): string;
export function stringValue(value: unknown, field: string, required: true): string;
export function stringValue(value: unknown, field: string, required: false): string | undefined;
export function stringValue(value: unknown, field: string, required = true): string | undefined {
  if (value === undefined || value === null || value === "") {
    if (required) throw new Error(`${field} is required`);
    return undefined;
  }
  if (typeof value !== "string") throw new Error(`${field} must be a string`);
  return value.trim();
}

export function emailValue(value: unknown): string {
  const email = stringValue(value, "email");
  if (!email || !/^\S+@\S+\.\S+$/.test(email)) throw new Error("email must be valid");
  return email.toLowerCase();
}

export function dateValue(value: unknown, field: string): string {
  const date = stringValue(value, field);
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new Error(`${field} must use YYYY-MM-DD`);
  return date;
}

export async function jsonBody(request: Request): Promise<Record<string, unknown>> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    throw new Error("request body must be valid JSON");
  }
  if (!isRecord(body)) throw new Error("request body must be an object");
  return body;
}
