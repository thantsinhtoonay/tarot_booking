export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

const defaultStringMaxLength = 2_000;
const maxJsonBytes = 256 * 1024;

export function stringValue(value: unknown, field: string): string;
export function stringValue(value: unknown, field: string, required: true, maxLength?: number): string;
export function stringValue(value: unknown, field: string, required: false, maxLength?: number): string | undefined;
export function stringValue(value: unknown, field: string, required = true, maxLength = defaultStringMaxLength): string | undefined {
  if (value === undefined || value === null) {
    if (required) throw new Error(`${field} is required`);
    return undefined;
  }
  if (typeof value !== "string") throw new Error(`${field} must be a string`);
  const trimmed = value.trim();
  if (!trimmed) {
    if (required) throw new Error(`${field} is required`);
    return undefined;
  }
  if (trimmed.length > maxLength) throw new Error(`${field} must be ${maxLength} characters or fewer`);
  return trimmed;
}

export function emailValue(value: unknown): string {
  const email = stringValue(value, "email", true, 254);
  if (!email || !/^\S+@\S+\.\S+$/.test(email)) throw new Error("email must be valid");
  return email.toLowerCase();
}

export function dateValue(value: unknown, field: string): string {
  const date = stringValue(value, field);
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new Error(`${field} must use YYYY-MM-DD`);
  const [year, month, day] = date.split("-").map(Number);
  const parsed = new Date(Date.UTC(year, month - 1, day));
  if (parsed.getUTCFullYear() !== year || parsed.getUTCMonth() !== month - 1 || parsed.getUTCDate() !== day) throw new Error(`${field} must be a real calendar date`);
  return date;
}

export function viberNumberValue(value: unknown): string {
  const raw = stringValue(value, "viberNumber", true, 32);
  const compact = raw.replace(/[\s().-]/g, "");
  const international = compact.startsWith("00") ? `+${compact.slice(2)}` : compact.startsWith("+") ? compact : compact.startsWith("0") ? `+95${compact.slice(1)}` : `+${compact}`;
  if (!/^\+\d{7,15}$/.test(international)) throw new Error("viberNumber must be a valid phone number");
  return international;
}

export function telegramIdValue(value: unknown): string | undefined {
  const raw = stringValue(value, "telegramId", false, 40);
  if (!raw) return undefined;
  const handle = raw.replace(/^@+/, "");
  if (!/^[A-Za-z0-9_]{5,32}$/.test(handle)) throw new Error("telegramId must be a valid username or ID");
  return handle;
}

export function facebookLinkValue(value: unknown): string | undefined {
  const raw = stringValue(value, "facebookLink", false, 2_048);
  if (!raw) return undefined;
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw new Error("facebookLink must be a valid URL");
  }
  const hostname = url.hostname.toLowerCase().replace(/^www\./, "");
  if (!(["http:", "https:"].includes(url.protocol)) || !(["facebook.com", "m.facebook.com", "fb.com"].includes(hostname))) throw new Error("facebookLink must be a valid Facebook URL");
  url.protocol = "https:";
  return url.toString();
}

export async function jsonBody(request: Request): Promise<Record<string, unknown>> {
  const contentLength = Number(request.headers.get("content-length"));
  if (Number.isFinite(contentLength) && contentLength > maxJsonBytes) throw new Error("request body is too large");
  const raw = await request.text();
  if (new TextEncoder().encode(raw).byteLength > maxJsonBytes) throw new Error("request body is too large");
  let body: unknown;
  try {
    body = JSON.parse(raw) as unknown;
  } catch {
    throw new Error("request body must be valid JSON");
  }
  if (!isRecord(body)) throw new Error("request body must be an object");
  return body;
}

export function uploadUrlValue(value: unknown): string {
  const url = stringValue(value, "receiptUrl", true, 120);
  if (!/^\/api\/upload\/[\w-]+\.(?:png|jpe?g|webp)$/i.test(url)) throw new Error("receiptUrl must reference an uploaded image");
  return url;
}
