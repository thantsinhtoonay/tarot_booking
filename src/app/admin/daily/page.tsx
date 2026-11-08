"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { api } from "@/lib/client";
import { GlassCard } from "@/components/GlassCard";
import { Icon } from "@/components/Icon";
import type { DailyTarotMessage } from "@/types";

type TarotCardOption = { filename: string; label: string; url: string };

export default function DailyPage() {
  const [form, setForm] = useState({ date: new Date().toISOString().slice(0, 10), cardName: "", cardImage: "", keywords: "", adviceText: "" });
  const [tarotCards, setTarotCards] = useState<TarotCardOption[]>([]);
  const [cardQuery, setCardQuery] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loadingCards, setLoadingCards] = useState(true);
  const [busy, setBusy] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState(false);
  const [hasPublished, setHasPublished] = useState(false);

  const update = (key: keyof typeof form, value: string) => setForm((current) => ({ ...current, [key]: value }));

  useEffect(() => {
    let active = true;
    setLoadingCards(true);
    void api<TarotCardOption[]>("/api/tarot-cards")
      .then((cards) => { if (active) setTarotCards(cards); })
      .catch((err) => { if (active) setError(err instanceof Error ? err.message : "Unable to load the tarot library"); })
      .finally(() => { if (active) setLoadingCards(false); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    let active = true;
    setLoadingMessage(true);
    setError("");
    void api<DailyTarotMessage | null>(`/api/daily-message?date=${encodeURIComponent(form.date)}`)
      .then((existing) => {
        if (!active) return;
        setHasPublished(Boolean(existing));
        if (existing) {
          setForm({ date: existing.date, cardName: existing.cardName ?? "", cardImage: existing.cardImage ?? "", keywords: existing.keywords?.join(", ") ?? "", adviceText: existing.adviceText });
        } else {
          setForm((current) => ({ ...current, cardName: "", cardImage: "", keywords: "", adviceText: "" }));
        }
      })
      .catch((err) => { if (active) setError(err instanceof Error ? err.message : "Unable to load daily message"); })
      .finally(() => { if (active) setLoadingMessage(false); });
    return () => { active = false; };
  }, [form.date]);

  const selectedCard = tarotCards.find((card) => card.url === form.cardImage);
  const visibleTarotCards = useMemo(() => {
    const query = cardQuery.trim().toLowerCase();
    if (!query) return tarotCards;
    return tarotCards.filter((card) => card.label.toLowerCase().includes(query));
  }, [cardQuery, tarotCards]);

  const chooseCard = (card: TarotCardOption) => {
    setError("");
    setMessage(`${card.label} selected and ready to publish.`);
    update("cardImage", card.url);
    if (!form.cardName || tarotCards.some((item) => item.label === form.cardName)) update("cardName", card.label);
  };

  const clearCard = () => {
    update("cardImage", "");
    setMessage("");
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    setError("");
    if (form.cardImage && !selectedCard) {
      setError("Choose a card from the bundled tarot library.");
      setBusy(false);
      return;
    }
    try {
      await api("/api/admin/daily-message", { method: "POST", body: JSON.stringify({ ...form, keywords: form.keywords.split(",").map((item) => item.trim()).filter(Boolean) }) });
      setHasPublished(true);
      setMessage("Daily message published.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to publish message");
    } finally {
      setBusy(false);
    }
  };

  const removeMessage = async () => {
    setBusy(true);
    setMessage("");
    setError("");
    try {
      await api(`/api/admin/daily-message?date=${encodeURIComponent(form.date)}`, { method: "DELETE" });
      setHasPublished(false);
      setForm((current) => ({ ...current, cardName: "", cardImage: "", keywords: "", adviceText: "" }));
      setMessage("Daily message removed.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to remove daily message");
    } finally {
      setBusy(false);
    }
  };

  const previewStyle = form.cardImage ? { backgroundImage: `linear-gradient(180deg, transparent 12%, rgba(11,13,27,.95) 88%), url('${form.cardImage}')` } : undefined;

  return (
    <div className="admin-page">
      <section className="page-title admin-page-title"><div><div className="eyebrow">Customer-facing message</div><h1>Daily message.</h1><p>Give customers one thoughtful message to carry into the day.</p></div><span className="admin-page-mark"><Icon name="sparkle" size={18} /> Editor</span></section>
      <div className="daily-editor-grid">
        <GlassCard className="daily-editor-card">
          <div className="admin-card-heading"><div><span className="eyebrow">Publish a reflection</span><h2>Set the tone for today.</h2></div><span className="admin-step-badge">01</span></div>
          <form className="form" onSubmit={submit}>
            <div className="form-two-col"><div className="field"><label htmlFor="message-date">Effective date</label><input className="date-time-input" id="message-date" type="date" value={form.date} onChange={(event) => update("date", event.target.value)} required /></div><div className="field"><label htmlFor="card-name">Card name</label><input id="card-name" value={form.cardName} onChange={(event) => update("cardName", event.target.value)} placeholder="The Star" /></div></div>
            <div className="field">
              <div className="field-label">Card image <span className="muted">(choose from the bundled tarot deck)</span></div>
              <div className="tarot-picker">
                <div className="tarot-picker-toolbar"><div><span className="eyebrow">Tarot library</span><small>{tarotCards.length ? `${tarotCards.length} cards available` : "Loading cards…"}</small></div><label className="tarot-search"><Icon name="search" size={16} /><span className="sr-only">Search tarot cards</span><input id="tarot-card-search" value={cardQuery} onChange={(event) => setCardQuery(event.target.value)} placeholder="Search the deck" /></label></div>
                {loadingCards ? <div className="tarot-picker-empty">Loading the bundled tarot deck…</div> : visibleTarotCards.length === 0 ? <div className="tarot-picker-empty">No cards match “{cardQuery}”.</div> : <div className="tarot-card-grid" role="listbox" aria-label="Bundled tarot cards">{visibleTarotCards.map((card) => <button className={`tarot-card-option ${form.cardImage === card.url ? "selected" : ""}`} type="button" role="option" aria-selected={form.cardImage === card.url} key={card.filename} onClick={() => chooseCard(card)}><span className="tarot-card-image" style={{ backgroundImage: `url('${card.url}')` }} role="img" aria-label={card.label} /><span className="tarot-card-name">{card.label}</span></button>)}</div>}
              </div>
              {selectedCard && <div className="tarot-selected-card"><span className="tarot-selected-image" style={{ backgroundImage: `url('${selectedCard.url}')` }} role="img" aria-label={selectedCard.label} /><span><small>Selected card</small><strong>{selectedCard.label}</strong></span><button type="button" className="text-button" onClick={clearCard}>Clear</button></div>}
            </div>
            <div className="field"><label htmlFor="keywords">Keywords <span className="muted">(comma separated)</span></label><input id="keywords" value={form.keywords} onChange={(event) => update("keywords", event.target.value)} placeholder="hope, renewal, trust" /></div>
            <div className="field"><label htmlFor="advice">Advice text</label><textarea id="advice" value={form.adviceText} onChange={(event) => update("adviceText", event.target.value)} required placeholder="Write a message for today's customer dashboard." /></div>
            {message && <p className="admin-success" role="status"><Icon name="check" size={15} /> {message}</p>}
            {error && <p className="form-message" role="alert">{error}</p>}
            <div className="daily-form-actions"><button className="button" disabled={busy || loadingCards || loadingMessage}>{busy ? "Saving…" : hasPublished ? "Update daily message" : "Publish daily message"}</button><button className="button-secondary" type="button" disabled={busy || loadingCards || loadingMessage || !hasPublished} onClick={() => void removeMessage()}>Delete</button></div>
          </form>
        </GlassCard>
        <GlassCard className="daily-preview-card"><div className="eyebrow">Live preview</div><h2>{form.cardName || "Your card"}</h2><p className="daily-preview-date">{form.date || "Choose a date"}</p><div className="daily-preview-art" style={previewStyle}><Icon name="sparkle" size={28} /></div><div className="daily-preview-copy"><div className="keyword-row">{form.keywords.split(",").map((item) => item.trim()).filter(Boolean).slice(0, 4).map((keyword) => <span key={keyword}>{keyword}</span>)}</div><p>{form.adviceText || "Your customer-facing advice will appear here as you write."}</p></div></GlassCard>
      </div>
    </div>
  );
}
