"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api, dateLabel, money } from "@/lib/client";
import type { Booking, DailyTarotMessage } from "@/types";
import { GlassCard } from "@/components/GlassCard";
import { Spinner } from "@/components/Spinner";
import { StatusBadge } from "@/components/StatusBadge";
import { Icon } from "@/components/Icon";
import { localizedFormatTitle, localizedReadingTitle, useLanguage } from "@/components/LanguageProvider";

export default function DashboardPage() {
  const { language, t } = useLanguage();
  const [message, setMessage] = useState<DailyTarotMessage | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    void Promise.all([api<DailyTarotMessage | null>("/api/daily-message"), api<Booking[]>("/api/bookings")])
      .then(([daily, items]) => { setMessage(daily); setBookings(items); })
      .catch((err) => setError(err instanceof Error ? err.message : t.dashboardLoadError))
      .finally(() => setLoading(false));
  }, [t.dashboardLoadError]);

  if (loading) return <Spinner label={t.preparingDashboard} />;
  const dailyCardStyle = message?.cardImage ? { backgroundImage: `linear-gradient(180deg, transparent 15%, rgba(11,13,27,.93) 88%), url('${message.cardImage}')` } : undefined;
  const today = new Intl.DateTimeFormat(language === "my" ? "my-MM" : "en-US", { month: "short", day: "numeric" }).format(new Date());

  return (
    <div>
      <div className="page-title">
        <div><div className="eyebrow">{t.yourReadingSpace}</div><h1>{t.welcomeBack}</h1><p>{t.dashboardIntro}</p></div>
        <Link className="button" href="/dashboard/book"><Icon name="plus" size={17} /> {t.bookReading}</Link>
      </div>
      {error && <div className="inline-error" role="alert">{error}</div>}
      <div className="dashboard-grid">
        <GlassCard className="daily-card" style={dailyCardStyle}>
          <div className="eyebrow">{t.dailyMessage} · {today}</div>
          <h2>{message?.cardName ?? t.messageWaiting}</h2>
          <p>{message?.adviceText ?? t.dailyMessageUnavailable}</p>
        </GlassCard>
        <div className="dashboard-stack">
          <GlassCard className="stat-card"><span>{t.readingsBooked}</span><strong>{bookings.length}</strong><Link className="ghost-button" href="/dashboard/profile">{t.viewHistory} <Icon name="arrow" size={15} /></Link></GlassCard>
          <GlassCard><div className="eyebrow">{t.quickGuidance}</div><h3 style={{ marginTop: ".5rem", color: "var(--gold-light)" }}>{t.readyWhenYouAre}</h3><p className="muted" style={{ marginTop: ".45rem", fontSize: ".82rem" }}>{t.quickGuidanceText}</p></GlassCard>
        </div>
      </div>
      <GlassCard style={{ marginTop: "1rem" }}>
        <div className="section-heading" style={{ marginBottom: ".4rem" }}><h2 style={{ fontSize: "1.35rem" }}>{t.recentBookings}</h2><Link className="ghost-button" href="/dashboard/profile">{t.seeAll} <Icon name="arrow" size={15} /></Link></div>
        {bookings.length === 0 ? <div className="empty-state"><h2>{t.firstReadingAhead}</h2><p>{t.firstReadingText}</p></div> : <div className="list">{bookings.slice(0, 3).map((booking) => <div className="list-row" key={booking.id}><div><strong>{localizedReadingTitle(t, booking.readingTypeId, booking.readingTypeId)} · {localizedFormatTitle(t, booking.sessionFormatId, booking.sessionFormatId)}</strong><small>{dateLabel(booking.createdAt.slice(0, 10), language === "my" ? "my-MM" : "en-US")} · {money(booking.amount)}</small></div><StatusBadge status={booking.status} /></div>)}</div>}
      </GlassCard>
    </div>
  );
}
