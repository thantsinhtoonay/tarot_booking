"use client";

import { FormEvent, useEffect, useState } from "react";
import { api, dateLabel, money } from "@/lib/client";
import type { Booking, Profile, User } from "@/types";
import { GlassCard } from "@/components/GlassCard";
import { Spinner } from "@/components/Spinner";
import { StatusBadge } from "@/components/StatusBadge";
import { localizedFormatTitle, localizedReadingTitle, useLanguage } from "@/components/LanguageProvider";

type ProfileData = { user: Omit<User, "passwordHash">; profile: Profile };

export default function ProfilePage() {
  const { language, t } = useLanguage();
  const [data, setData] = useState<ProfileData | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [form, setForm] = useState({ name: "", phone: "", dob: "", tob: "", bio: "" });
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    void Promise.all([api<ProfileData>("/api/profile"), api<Booking[]>("/api/bookings")])
      .then(([profile, items]) => { setData(profile); setBookings(items); setForm({ name: profile.user.name, phone: profile.user.phone ?? "", dob: profile.user.dob ?? "", tob: profile.user.tob ?? "", bio: profile.profile.bio ?? "" }); })
      .catch((err) => setError(err instanceof Error ? err.message : t.unableLoadProfile));
  }, [t.unableLoadProfile]);

  const update = (key: keyof typeof form, value: string) => setForm((current) => ({ ...current, [key]: value }));
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true); setMessage(""); setError("");
    try { const updated = await api<ProfileData>("/api/profile", { method: "PATCH", body: JSON.stringify(form) }); setData(updated); setMessage(t.profileSaved); }
    catch (err) { setError(err instanceof Error ? err.message : t.unableSaveProfile); }
    finally { setBusy(false); }
  };

  if (!data && !error) return <Spinner label={t.yourDetails} />;
  return (
    <div>
      <div className="page-title"><div><div className="eyebrow">{t.yourDetails}</div><h1>{t.profileHistory}</h1><p>{t.profileIntro}</p></div></div>
      {error && <div className="inline-error" role="alert">{error}</div>}
      <div className="profile-grid">
        <GlassCard>
          <div className="eyebrow">{t.profileSection}</div>
          <form className="form" onSubmit={submit}>
            <div className="field"><label htmlFor="profile-name">{t.name}</label><input id="profile-name" value={form.name} onChange={(event) => update("name", event.target.value)} /></div>
            <div className="field"><label htmlFor="profile-phone">{t.phone}</label><input id="profile-phone" value={form.phone} onChange={(event) => update("phone", event.target.value)} /></div>
            <div className="choice-grid">
              <div className="field"><label htmlFor="profile-dob">{t.dateOfBirth}</label><input className="date-time-input" id="profile-dob" type="date" value={form.dob} onChange={(event) => update("dob", event.target.value)} /></div>
              <div className="field"><label htmlFor="profile-tob">{t.timeOfBirth}</label><input className="date-time-input" id="profile-tob" type="time" value={form.tob} onChange={(event) => update("tob", event.target.value)} /></div>
            </div>
            <div className="field"><label htmlFor="profile-bio">{t.aNoteAboutYou}</label><textarea id="profile-bio" value={form.bio} onChange={(event) => update("bio", event.target.value)} /></div>
            {message && <p className="admin-success" role="status">{message}</p>}
            <button className="button" disabled={busy}>{busy ? t.saving : t.saveProfile}</button>
          </form>
        </GlassCard>
        <GlassCard>
          <div className="section-heading" style={{ marginBottom: ".5rem" }}><div><div className="eyebrow">{t.yourJourney}</div><h2 style={{ fontSize: "1.35rem" }}>{t.bookingHistory}</h2></div></div>
          {bookings.length === 0 ? <div className="empty-state"><h2>{t.noReadings}</h2><p>{t.noReadingsText}</p></div> : <div className="list">{bookings.map((booking) => <div className="list-row" key={booking.id}><div><strong>{localizedReadingTitle(t, booking.readingTypeId, booking.readingTypeId)} · {localizedFormatTitle(t, booking.sessionFormatId, booking.sessionFormatId)}</strong><small>{dateLabel(booking.createdAt.slice(0, 10), language === "my" ? "my-MM" : "en-US")} · {money(booking.amount)}</small></div><StatusBadge status={booking.status} /></div>)}</div>}
        </GlassCard>
      </div>
    </div>
  );
}
