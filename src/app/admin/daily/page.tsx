"use client";

import { FormEvent, useState } from "react";
import { api } from "@/lib/client";
import { GlassCard } from "@/components/GlassCard";

export default function DailyPage() {
  const [form, setForm] = useState({ date: new Date().toISOString().slice(0, 10), cardName: "", cardImage: "", keywords: "", adviceText: "" });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const update = (key: keyof typeof form, value: string) => setForm((current) => ({ ...current, [key]: value }));
  const submit = async (event: FormEvent) => { event.preventDefault(); setBusy(true); setMessage(""); setError(""); try { await api("/api/admin/daily-message", { method: "POST", body: JSON.stringify({ ...form, keywords: form.keywords.split(",").map((item) => item.trim()).filter(Boolean) }) }); setMessage("Daily message published."); } catch (err) { setError(err instanceof Error ? err.message : "Unable to publish message"); } finally { setBusy(false); } };
  return <div><div className="page-title"><div><div className="eyebrow">Customer dashboard</div><h1>Daily message.</h1><p>Give customers one thoughtful message to carry into the day.</p></div></div><div className="form-shell"><GlassCard><form className="form" onSubmit={submit}><div className="field"><label htmlFor="message-date">Effective date</label><input id="message-date" type="date" value={form.date} onChange={(e) => update("date", e.target.value)} /></div><div className="field"><label htmlFor="card-name">Card name</label><input id="card-name" value={form.cardName} onChange={(e) => update("cardName", e.target.value)} placeholder="The Star" /></div><div className="field"><label htmlFor="card-image">Card image path</label><input id="card-image" value={form.cardImage} onChange={(e) => update("cardImage", e.target.value)} placeholder="/images/tarot/17-star.jpg" /></div><div className="field"><label htmlFor="keywords">Keywords</label><input id="keywords" value={form.keywords} onChange={(e) => update("keywords", e.target.value)} placeholder="hope, renewal, trust" /></div><div className="field"><label htmlFor="advice">Advice text</label><textarea id="advice" value={form.adviceText} onChange={(e) => update("adviceText", e.target.value)} required placeholder="Write a message for today's customer dashboard." /></div>{message && <p style={{ color: "var(--success)", fontSize: ".8rem" }}>{message}</p>}{error && <p className="form-message">{error}</p>}<button className="button" disabled={busy}>{busy ? "Publishing…" : "Publish daily message"}</button></form></GlassCard></div></div>;
}
