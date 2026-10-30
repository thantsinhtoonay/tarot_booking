export type ApiResult<T> = { ok: true; data: T } | { ok: false; error: string };

export async function api<T>(url: string, init?: RequestInit): Promise<T> {
  const isFormData = typeof FormData !== "undefined" && init?.body instanceof FormData;
  const response = await fetch(url, {
    ...init,
    credentials: "include",
    headers: isFormData ? { ...(init?.headers ?? {}) } : { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
  const body = (await response.json()) as ApiResult<T>;
  if (!body.ok || !response.ok) throw new Error(body.ok ? `Request failed (${response.status})` : body.error);
  return body.data;
}

export function money(value: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "MMK", maximumFractionDigits: 0 }).format(value);
}

export function dateLabel(value: string) {
  return new Intl.DateTimeFormat("en-US", { weekday: "short", month: "short", day: "numeric" }).format(new Date(`${value}T00:00:00`));
}
