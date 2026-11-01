"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api, dateLabel, money } from "@/lib/client";
import { GlassCard } from "@/components/GlassCard";
import { Icon } from "@/components/Icon";
import { Spinner } from "@/components/Spinner";
import { StatusBadge } from "@/components/StatusBadge";

type AdminBooking = {
  id: string;
  customer: string;
  readingTypeId: string;
  amount: number;
  status: "pending_payment" | "confirmed" | "completed" | "rejected";
  createdAt: string;
  slot?: { date: string; startTime: string; endTime: string };
};

export default function AdminPage() {
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = () => {
    setLoading(true);
    setError("");
    void api<AdminBooking[]>("/api/admin/bookings")
      .then(setBookings)
      .catch((err) => setError(err instanceof Error ? err.message : "Unable to load the admin overview"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  if (loading) return <Spinner label="Opening astrologer workspace…" />;

  const pending = bookings.filter((booking) => booking.status === "pending_payment").length;
  const confirmed = bookings.filter((booking) => booking.status === "confirmed").length;
  const totalValue = bookings.reduce((sum, booking) => sum + booking.amount, 0);

  return (
    <div className="admin-overview">
      <section className="admin-welcome">
        <div>
          <div className="eyebrow">Astrologer workspace</div>
          <h1>Read the room.</h1>
          <p>One clear place to review new bookings, protect your time, and keep the customer experience personal.</p>
        </div>
        <div className="admin-welcome-actions">
          <Link className="button" href="/admin/bookings"><Icon name="search" size={17} /> Review bookings</Link>
          <Link className="button-secondary" href="/admin/daily"><Icon name="sparkle" size={17} /> Publish daily message</Link>
        </div>
      </section>

      {error && <div className="inline-error" role="alert"><span>{error}</span><button className="ghost-button" onClick={load}>Try again</button></div>}

      <section className="admin-stats" aria-label="Booking summary">
        <GlassCard className="admin-stat-card admin-stat-primary"><span className="admin-stat-icon"><Icon name="calendar" size={19} /></span><span className="admin-stat-label">Total bookings</span><strong>{bookings.length}</strong><small>All customer requests</small></GlassCard>
        <GlassCard className="admin-stat-card"><span className="admin-stat-icon"><Icon name="clock" size={19} /></span><span className="admin-stat-label">Needs review</span><strong>{pending}</strong><small>Waiting for payment decision</small></GlassCard>
        <GlassCard className="admin-stat-card"><span className="admin-stat-icon"><Icon name="check" size={19} /></span><span className="admin-stat-label">Confirmed</span><strong>{confirmed}</strong><small>Ready for the next step</small></GlassCard>
        <GlassCard className="admin-stat-card"><span className="admin-stat-icon"><Icon name="sparkle" size={19} /></span><span className="admin-stat-label">Booking value</span><strong>{money(totalValue)}</strong><small>Across all current bookings</small></GlassCard>
      </section>

      <section className="admin-work-grid">
        <GlassCard className="admin-activity-card">
          <div className="section-heading admin-section-heading"><div><div className="eyebrow">Latest activity</div><h2>Recent bookings</h2><p>Keep the next reading within reach.</p></div><Link className="ghost-button" href="/admin/bookings">View all <Icon name="arrow" size={15} /></Link></div>
          {bookings.length === 0 ? <div className="admin-empty-state"><span className="admin-empty-icon"><Icon name="calendar" size={22} /></span><h3>Your workspace is ready.</h3><p>New customer bookings will appear here after the first booking is submitted.</p><Link className="button-secondary" href="/admin/calendar">Open calendar</Link></div> : <div className="list admin-list">{bookings.slice(0, 6).map((booking) => <div className="list-row admin-list-row" key={booking.id}><div><strong>{booking.customer}</strong><small>{booking.readingTypeId} · {booking.slot ? `${dateLabel(booking.slot.date)} · ${booking.slot.startTime}` : "No slot selected"}</small></div><div className="admin-list-meta"><span>{money(booking.amount)}</span><StatusBadge status={booking.status} /></div></div>)}</div>}
        </GlassCard>
        <GlassCard className="admin-quick-card"><div className="eyebrow">Quick actions</div><h2>Keep the practice moving.</h2><div className="admin-action-list"><Link href="/admin/bookings"><span className="admin-action-icon"><Icon name="check" size={18} /></span><span><strong>Review payments</strong><small>Approve or reject submitted proof.</small></span><Icon name="arrow" size={16} /></Link><Link href="/admin/calendar"><span className="admin-action-icon"><Icon name="calendar" size={18} /></span><span><strong>Open calendar</strong><small>See your reading schedule at a glance.</small></span><Icon name="arrow" size={16} /></Link><Link href="/admin/daily"><span className="admin-action-icon"><Icon name="sparkle" size={18} /></span><span><strong>Write today’s message</strong><small>Give customers one thoughtful cue.</small></span><Icon name="arrow" size={16} /></Link></div></GlassCard>
      </section>
    </div>
  );
}
