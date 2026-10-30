"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api, dateLabel, money } from "@/lib/client";
import { GlassCard } from "@/components/GlassCard";
import { Spinner } from "@/components/Spinner";
import { StatusBadge } from "@/components/StatusBadge";

type AdminBooking = { id: string; customer: string; readingTypeId: string; amount: number; status: "pending_payment" | "confirmed" | "completed" | "rejected"; createdAt: string; slot?: { date: string; startTime: string; endTime: string } };

export default function AdminPage() {
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => { void api<AdminBooking[]>("/api/admin/bookings").then(setBookings).catch((err) => setError(err instanceof Error ? err.message : "Unable to load admin overview")).finally(() => setLoading(false)); }, []);
  if (loading) return <Spinner label="Loading overview…" />;
  const pending = bookings.filter((booking) => booking.status === "pending_payment").length;
  return <div><div className="page-title"><div><div className="eyebrow">Astrologer portal</div><h1>Good morning.</h1><p>Keep an eye on the next reading and the messages waiting for your attention.</p></div><Link className="button" href="/admin/bookings">Review bookings</Link></div>{error && <div className="inline-error">{error}</div>}<div className="stats-grid"><GlassCard className="stat-card"><span>Total bookings</span><strong>{bookings.length}</strong></GlassCard><GlassCard className="stat-card"><span>Awaiting payment review</span><strong>{pending}</strong></GlassCard><GlassCard className="stat-card"><span>Confirmed</span><strong>{bookings.filter((booking) => booking.status === "confirmed").length}</strong></GlassCard></div><GlassCard style={{ marginTop: "1rem" }}><div className="section-heading"><div><div className="eyebrow">Latest activity</div><h2>Recent bookings</h2></div><Link className="ghost-button" href="/admin/calendar">Open calendar</Link></div>{bookings.length === 0 ? <div className="empty-state"><h2>No bookings yet.</h2><p>New customer bookings will show here.</p></div> : <div className="list">{bookings.slice(0, 6).map((booking) => <div className="list-row" key={booking.id}><div><strong>{booking.customer} · {booking.readingTypeId}</strong><small>{booking.slot ? `${dateLabel(booking.slot.date)} · ${booking.slot.startTime}` : booking.createdAt} · {money(booking.amount)}</small></div><StatusBadge status={booking.status} /></div>)}</div>}</GlassCard></div>;
}
