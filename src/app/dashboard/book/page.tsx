"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { api, dateLabel, money } from "@/lib/client";
import type { ReadingType, SessionFormat, TimeSlot } from "@/types";
import { GlassCard } from "@/components/GlassCard";
import { Spinner } from "@/components/Spinner";
import { Icon } from "@/components/Icon";

type Catalog = { readingTypes: ReadingType[]; sessionFormats: SessionFormat[] };

export default function BookingPage() {
  const [catalog, setCatalog] = useState<Catalog | null>(null);
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [step, setStep] = useState(1);
  const [readingTypeId, setReadingTypeId] = useState<ReadingType["id"]>("love");
  const [sessionFormatId, setSessionFormatId] = useState<SessionFormat["id"]>("written");
  const [date, setDate] = useState("");
  const [slotId, setSlotId] = useState("");
  const [form, setForm] = useState({ fullName: "", dob: "", tob: "", questions: "", wallet: "kpay", transactionId: "" });
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [complete, setComplete] = useState(false);

  useEffect(() => { void Promise.all([api<Catalog>("/api/services"), api<TimeSlot[]>("/api/slots")]).then(([items, available]) => { setCatalog(items); setSlots(available); setDate(available[0]?.date ?? ""); }).catch((err) => setError(err instanceof Error ? err.message : "Unable to load booking options")).finally(() => setLoading(false)); }, []);
  const dates = useMemo(() => Array.from(new Set(slots.map((slot) => slot.date))), [slots]);
  const dateSlots = slots.filter((slot) => slot.date === date);
  const reading = catalog?.readingTypes.find((item) => item.id === readingTypeId);
  const format = catalog?.sessionFormats.find((item) => item.id === sessionFormatId);
  const amount = (reading?.price ?? 0) + (format?.priceDelta ?? 0);
  const update = (key: keyof typeof form, value: string) => setForm((current) => ({ ...current, [key]: value }));
  const next = () => { setError(""); if (step === 1 && !readingTypeId) return setError("Choose a reading focus."); if (step === 2 && !slotId) return setError("Choose an available time slot."); if (step === 3 && (!form.fullName || !form.dob || !form.tob)) return setError("Please complete your name and birth details."); setStep((value) => Math.min(4, value + 1)); };
  const submit = async () => {
    if (!slotId || !catalog) return;
    setBusy(true); setError("");
    try { const booking = await api<{ id: string }>("/api/bookings", { method: "POST", body: JSON.stringify({ readingTypeId, sessionFormatId, slotId, fullName: form.fullName, dob: form.dob, tob: form.tob, questions: form.questions, wallet: form.wallet }) }); let receiptUrl: string | undefined; if (receiptFile) { const upload = new FormData(); upload.append("file", receiptFile); const result = await api<{ url: string }>("/api/upload", { method: "POST", body: upload }); receiptUrl = result.url; } await api(`/api/bookings/${booking.id}/payment`, { method: "POST", body: JSON.stringify({ wallet: form.wallet, transactionId: form.transactionId || "PENDING-LOCAL", receiptUrl }) }); setComplete(true); }
    catch (err) { setError(err instanceof Error ? err.message : "Unable to create booking"); } finally { setBusy(false); }
  };
  if (loading) return <Spinner label="Preparing your booking options…" />;
  if (complete) return <div className="form-shell"><GlassCard className="empty-state"><div className="icon-disc" style={{ margin: "0 auto 1rem" }}><Icon name="check" /></div><h2>Your reading is reserved.</h2><p>Your payment proof is now waiting for review. You can follow the status from your profile.</p><Link className="button" style={{ marginTop: "1.4rem" }} href="/dashboard/profile">View booking status</Link></GlassCard></div>;
  return <div><div className="page-title"><div><div className="eyebrow">A guided booking</div><h1>Book your reading.</h1><p>Move through four simple steps. You can change your choices before submitting.</p></div></div>{error && <div className="inline-error">{error}</div>}<div className="wizard"><div><div className="stepper">{["Focus", "Time", "Details", "Payment"].map((label, index) => <span className={`step ${step >= index + 1 ? "active" : ""}`} key={label}><b>{index + 1}</b>{label}</span>)}</div><GlassCard>{step === 1 && <><div className="eyebrow">Step one</div><h2 style={{ marginTop: ".5rem" }}>What would you like clarity on?</h2><div className="choice-grid">{catalog?.readingTypes.map((item) => <button type="button" className={`choice ${readingTypeId === item.id ? "selected" : ""}`} key={item.id} onClick={() => setReadingTypeId(item.id)}><strong>{item.title}</strong><small>{item.description}</small><small>{money(item.price)}</small></button>)}</div></>}{step === 2 && <><div className="eyebrow">Step two</div><h2 style={{ marginTop: ".5rem" }}>Choose a format and time.</h2><div className="choice-grid">{catalog?.sessionFormats.map((item) => <button type="button" className={`choice ${sessionFormatId === item.id ? "selected" : ""}`} key={item.id} onClick={() => setSessionFormatId(item.id)}><strong>{item.title}</strong><small>{item.durationMin} minutes · {item.priceDelta ? `+${money(item.priceDelta)}` : "included"}</small></button>)}</div><div style={{ marginTop: "1.4rem" }}><label className="eyebrow">Date</label><div className="date-strip">{dates.map((item) => <button type="button" className={`date-pill ${date === item ? "selected" : ""}`} key={item} onClick={() => { setDate(item); setSlotId(""); }}>{dateLabel(item)}</button>)}</div><label className="eyebrow">Available times</label><div className="slot-grid">{dateSlots.map((item) => <button type="button" className={`slot ${slotId === item.id ? "selected" : ""}`} key={item.id} onClick={() => setSlotId(item.id)}><Icon name="clock" size={14} />{item.startTime}–{item.endTime}</button>)}</div></div></>}{step === 3 && <><div className="eyebrow">Step three</div><h2 style={{ marginTop: ".5rem" }}>Tell the cards a little about you.</h2><div className="form"><div className="field"><label htmlFor="fullName">Full name</label><input id="fullName" value={form.fullName} onChange={(e) => update("fullName", e.target.value)} /></div><div className="choice-grid"><div className="field"><label htmlFor="dob">Date of birth</label><input id="dob" type="date" value={form.dob} onChange={(e) => update("dob", e.target.value)} /></div><div className="field"><label htmlFor="tob">Time of birth</label><input id="tob" type="time" value={form.tob} onChange={(e) => update("tob", e.target.value)} /></div></div><div className="field"><label htmlFor="questions">Your question</label><textarea id="questions" value={form.questions} onChange={(e) => update("questions", e.target.value)} placeholder="What would you like the reading to explore?" /></div></div></>}{step === 4 && <><div className="eyebrow">Step four</div><h2 style={{ marginTop: ".5rem" }}>Complete the payment note.</h2><div className="form"><div className="field"><label htmlFor="wallet">Wallet</label><select id="wallet" value={form.wallet} onChange={(e) => update("wallet", e.target.value)}><option value="kpay">KPay</option><option value="wavepay">WavePay</option><option value="aya">AYA Pay</option><option value="cbpay">CB Pay</option></select></div><div className="field"><label htmlFor="transactionId">Transaction ID / last 6 digits</label><input id="transactionId" value={form.transactionId} onChange={(e) => update("transactionId", e.target.value)} placeholder="Enter after payment" /></div><div className="field"><label htmlFor="receiptFile">Payment receipt image</label><input id="receiptFile" type="file" accept="image/png,image/jpeg,image/webp" onChange={(e) => setReceiptFile(e.target.files?.[0] ?? null)} /><small className="muted">PNG, JPEG, or WebP up to 5MB.</small></div></div></>}</GlassCard><div className="wizard-actions"><button className="button-secondary" type="button" onClick={() => setStep((value) => Math.max(1, value - 1))} disabled={step === 1}>Back</button>{step < 4 ? <button className="button" type="button" onClick={next}>Continue <Icon name="arrow" size={16} /></button> : <button className="button" type="button" onClick={() => void submit()} disabled={busy}>{busy ? "Submitting…" : "Reserve reading"}</button>}</div></div><GlassCard className="summary-card"><div className="eyebrow">Your summary</div><h3 style={{ marginTop: ".4rem" }}>{reading?.title ?? "Choose a focus"}</h3><div className="summary-line"><span>Format</span><strong>{format?.title ?? "—"}</strong></div><div className="summary-line"><span>Time</span><strong>{slots.find((slot) => slot.id === slotId)?.startTime ?? "—"}</strong></div><div className="summary-total"><span>Total</span><strong>{money(amount)}</strong></div></GlassCard></div></div>;
}
