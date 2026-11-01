"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api, dateLabel, money } from "@/lib/client";
import type { Booking, DailyTarotMessage } from "@/types";
import { GlassCard } from "@/components/GlassCard";
import { Spinner } from "@/components/Spinner";
import { StatusBadge } from "@/components/StatusBadge";
import { Icon } from "@/components/Icon";

export default function DashboardPage() {
  const [message, setMessage] = useState<DailyTarotMessage | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => { void Promise.all([api<DailyTarotMessage | null>("/api/daily-message"), api<Booking[]>("/api/bookings")]).then(([daily, items]) => { setMessage(daily); setBookings(items); }).catch((err) => setError(err instanceof Error ? err.message : "Unable to load dashboard")).finally(() => setLoading(false)); }, []);
  if (loading) return <Spinner label="Gathering your reading space…" />;
  const dailyCardStyle = message?.cardImage ? { backgroundImage: `linear-gradient(180deg, transparent 15%, rgba(11,13,27,.93) 88%), url('${message.cardImage}')` } : undefined;
  return <div><div className="page-title"><div><div className="eyebrow">Your reading space</div><h1>Welcome back.</h1><p>Take a breath. Your next step can be small and still meaningful.</p></div><Link className="button" href="/dashboard/book"><Icon name="plus" size={17} /> Book a reading</Link></div>{error && <div className="inline-error">{error}</div>}<div className="dashboard-grid"><GlassCard className="daily-card" style={dailyCardStyle}><div className="eyebrow">Daily message · {new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(new Date())}</div><h2>{message?.cardName ?? "A message is waiting"}</h2><p>{message?.adviceText ?? "Your daily message will appear here when it has been published."}</p></GlassCard><div className="dashboard-stack"><GlassCard className="stat-card"><span>Readings booked</span><strong>{bookings.length}</strong><Link className="ghost-button" href="/dashboard/profile">View history <Icon name="arrow" size={15} /></Link></GlassCard><GlassCard><div className="eyebrow">Quick guidance</div><h3 style={{ marginTop: ".5rem", color: "var(--gold-light)" }}>Ready when you are.</h3><p className="muted" style={{ marginTop: ".45rem", fontSize: ".82rem" }}>Choose a focus, find a time, and bring the question that has been circling.</p></GlassCard></div></div><GlassCard style={{ marginTop: "1rem" }}><div className="section-heading" style={{ marginBottom: ".4rem" }}><h2 style={{ fontSize: "1.35rem" }}>Recent bookings</h2><Link className="ghost-button" href="/dashboard/profile">See all <Icon name="arrow" size={15} /></Link></div>{bookings.length === 0 ? <div className="empty-state"><h2>Your first reading is still ahead.</h2><p>Start with the focus that feels most present today.</p></div> : <div className="list">{bookings.slice(0, 3).map((booking) => <div className="list-row" key={booking.id}><div><strong>{booking.readingTypeId} · {booking.sessionFormatId}</strong><small>{dateLabel(booking.createdAt.slice(0, 10))} · {money(booking.amount)}</small></div><StatusBadge status={booking.status} /></div>)}</div>}</GlassCard></div>;
}
