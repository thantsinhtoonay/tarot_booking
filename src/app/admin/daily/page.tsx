"use client";

import { ChangeEvent, FormEvent, useState } from "react";
import { api } from "@/lib/client";
import { GlassCard } from "@/components/GlassCard";
import { Icon } from "@/components/Icon";

type UploadResult = { url: string; filename: string };

export default function DailyPage() {
  const [form, setForm] = useState({ date: new Date().toISOString().slice(0, 10), cardName: "", cardImage: "", keywords: "", adviceText: "" });
  const [imageName, setImageName] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [busy, setBusy] = useState(false);

  const update = (key: keyof typeof form, value: string) => setForm((current) => ({ ...current, [key]: value }));

  const chooseImage = async (event: ChangeEvent<HTMLInputElement>) => {
    const input = event.currentTarget;
    const file = input.files?.[0];
    if (!file) return;

    setError("");
    setMessage("");
    if (!(["image/png", "image/jpeg", "image/webp"] as string[]).includes(file.type)) {
      setError("Choose a PNG, JPG, or WebP image.");
      input.value = "";
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("The image must be 5MB or smaller.");
      input.value = "";
      return;
    }

    setUploading(true);
    try {
      const body = new FormData();
      body.append("file", file);
      const uploaded = await api<UploadResult>("/api/upload", { method: "POST", body });
      update("cardImage", uploaded.url);
      setImageName(file.name);
      setMessage("Image selected and ready to publish.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to upload image");
    } finally {
      setUploading(false);
      input.value = "";
    }
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    setError("");
    try {
      await api("/api/admin/daily-message", { method: "POST", body: JSON.stringify({ ...form, keywords: form.keywords.split(",").map((item) => item.trim()).filter(Boolean) }) });
      setMessage("Daily message published.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to publish message");
    } finally {
      setBusy(false);
    }
  };

  const previewStyle = form.cardImage ? { backgroundImage: `linear-gradient(180deg, transparent 12%, rgba(11,13,27,.95) 88%), url('${form.cardImage}')` } : undefined;

  return (
    <div className="admin-page">
      <section className="page-title admin-page-title"><div><div className="eyebrow">Customer dashboard</div><h1>Daily message.</h1><p>Give customers one thoughtful message to carry into the day.</p></div><span className="admin-page-mark"><Icon name="sparkle" size={18} /> Editor</span></section>
      <div className="daily-editor-grid">
        <GlassCard className="daily-editor-card">
          <div className="admin-card-heading"><div><span className="eyebrow">Publish a reflection</span><h2>Set the tone for today.</h2></div><span className="admin-step-badge">01</span></div>
          <form className="form" onSubmit={submit}>
            <div className="form-two-col"><div className="field"><label htmlFor="message-date">Effective date</label><input id="message-date" type="date" value={form.date} onChange={(event) => update("date", event.target.value)} required /></div><div className="field"><label htmlFor="card-name">Card name</label><input id="card-name" value={form.cardName} onChange={(event) => update("cardName", event.target.value)} placeholder="The Star" /></div></div>
            <div className="field">
              <label htmlFor="card-image">Card image <span className="muted">(optional)</span></label>
              <div className="image-upload-control">
                <input className="file-input" id="card-image" type="file" accept="image/png,image/jpeg,image/webp" onChange={chooseImage} />
                <label className="file-picker-button" htmlFor="card-image"><Icon name="plus" size={16} /> {uploading ? "Uploading image…" : "Choose card image"}</label>
                <span className="file-picker-meta">{imageName || "PNG, JPG, or WebP · max 5MB"}</span>
              </div>
              {form.cardImage && <div className="image-upload-preview" style={{ backgroundImage: `url('${form.cardImage}')` }} role="img" aria-label={imageName || "Selected tarot card image"}><button type="button" className="image-remove-button" onClick={() => { update("cardImage", ""); setImageName(""); setMessage(""); }} aria-label="Remove selected card image"><Icon name="x" size={15} /></button></div>}
            </div>
            <div className="field"><label htmlFor="keywords">Keywords <span className="muted">(comma separated)</span></label><input id="keywords" value={form.keywords} onChange={(event) => update("keywords", event.target.value)} placeholder="hope, renewal, trust" /></div>
            <div className="field"><label htmlFor="advice">Advice text</label><textarea id="advice" value={form.adviceText} onChange={(event) => update("adviceText", event.target.value)} required placeholder="Write a message for today's customer dashboard." /></div>
            {message && <p className="admin-success" role="status"><Icon name="check" size={15} /> {message}</p>}
            {error && <p className="form-message" role="alert">{error}</p>}
            <button className="button" disabled={busy || uploading}>{busy ? "Publishing…" : "Publish daily message"}</button>
          </form>
        </GlassCard>
        <GlassCard className="daily-preview-card"><div className="eyebrow">Live preview</div><h2>{form.cardName || "Your card"}</h2><p className="daily-preview-date">{form.date || "Choose a date"}</p><div className="daily-preview-art" style={previewStyle}><Icon name="sparkle" size={28} /></div><div className="daily-preview-copy"><div className="keyword-row">{form.keywords.split(",").map((item) => item.trim()).filter(Boolean).slice(0, 4).map((keyword) => <span key={keyword}>{keyword}</span>)}</div><p>{form.adviceText || "Your customer-facing advice will appear here as you write."}</p></div></GlassCard>
      </div>
    </div>
  );
}
