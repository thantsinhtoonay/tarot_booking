"use client";

import { FormEvent, useEffect, useState } from "react";
import { api, dateLabel, money } from "@/lib/client";
import type { Booking, Profile, User } from "@/types";
import { GlassCard } from "@/components/GlassCard";
import { Spinner } from "@/components/Spinner";
import { StatusBadge } from "@/components/StatusBadge";

type ProfileData = { user: Omit<User, "passwordHash">; profile: Profile };

export default function ProfilePage() {
  const [data, setData] = useState<ProfileData | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [form, setForm] = useState({ name: "", phone: "", dob: "", tob: "", bio: "" });
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  useEffect(() => { void Promise.all([api<ProfileData>("/api/profile"), api<Booking[]>("/api/bookings")]).then(([profile, items]) => { setData(profile); setBookings(items); setForm({ name: profile.user.name, phone: profile.user.phone ?? "", dob: profile.user.dob ?? "", tob: profile.user.tob ?? "", bio: profile.profile.bio ?? "" }); }).catch((err) => setError(err instanceof Error ? err.message : "Unable to load profile")); }, []);
  const update = (key: keyof typeof form, value: string) => setForm((current) => ({ ...current, [key]: value }));
  const submit = async (event: FormEvent) => { event.preventDefault(); setBusy(true); setMessage(""); setError(""); try { const updated = await api<ProfileData>("/api/profile", { method: "PATCH", body: JSON.stringify(form) }); setData(updated); setMessage("Profile saved."); } catch (err) { setError(err instanceof Error ? err.message : "Unable to save profile"); } finally { setBusy(false); } };
  if (!data && !error) return <Spinner label="Opening your profile…" />;
  return <div><div className="page-title"><div><div className="eyebrow">Your details</div><h1>Profile & history.</h1><p>Keep your details current so each reading can meet you where you are.</p></div></div>{error && <div className="inline-error">{error}</div>}<div className="profile-grid"><GlassCard><div className="eyebrow">Profile</div><form className="form" onSubmit={submit}><div className="field"><label htmlFor="profile-name">Name</label><input id="profile-name" value={form.name} onChange={(e) => update("name", e.target.value)} /></div><div className="field"><label htmlFor="profile-phone">Phone</label><input id="profile-phone" value={form.phone} onChange={(e) => update("phone", e.target.value)} /></div><div className="choice-grid"><div className="field"><label htmlFor="profile-dob">Date of birth</label><input id="profile-dob" type="date" value={form.dob} onChange={(e) => update("dob", e.target.value)} /></div><div className="field"><label htmlFor="profile-tob">Time of birth</label><input id="profile-tob" type="time" value={form.tob} onChange={(e) => update("tob", e.target.value)} /></div></div><div className="field"><label htmlFor="profile-bio">A note about you</label><textarea id="profile-bio" value={form.bio} onChange={(e) => update("bio", e.target.value)} /></div>{message && <p style={{ color: "var(--success)", fontSize: ".8rem" }}>{message}</p>}<button className="button" disabled={busy}>{busy ? "Saving…" : "Save profile"}</button></form></GlassCard><GlassCard><div className="section-heading" style={{ marginBottom: ".5rem" }}><div><div className="eyebrow">Your journey</div><h2 style={{ fontSize: "1.35rem" }}>Booking history</h2></div></div>{bookings.length === 0 ? <div className="empty-state"><h2>No readings yet.</h2><p>Your booking history will appear here.</p></div> : <div className="list">{bookings.map((booking) => <div className="list-row" key={booking.id}><div><strong>{booking.readingTypeId} · {booking.sessionFormatId}</strong><small>{dateLabel(booking.createdAt.slice(0, 10))} · {money(booking.amount)}</small></div><StatusBadge status={booking.status} /></div>)}</div>}</GlassCard></div></div>;
}
