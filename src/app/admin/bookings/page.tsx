"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { api, dateLabel, money } from "@/lib/client";
import { GlassCard } from "@/components/GlassCard";
import { BookingDetailDrawer, type AdminBookingDetail } from "@/components/BookingDetailDrawer";
import { Icon } from "@/components/Icon";
import { Spinner } from "@/components/Spinner";
import { StatusBadge } from "@/components/StatusBadge";
import { readingTypeLabel, sessionFormatLabel } from "@/lib/site-config";

type AdminBooking = AdminBookingDetail;

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [status, setStatus] = useState("");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState("");
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<AdminBooking | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setBookings(await api<AdminBooking[]>(`/api/admin/bookings${status ? `?status=${status}` : ""}`));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load bookings");
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => { void load(); }, [load]);

  const visibleBookings = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return bookings;
    return bookings.filter((booking) => `${booking.customer} ${readingTypeLabel(booking.readingTypeId, booking.readingType?.title)} ${sessionFormatLabel(booking.sessionFormatId)} ${booking.transactionId ?? ""}`.toLowerCase().includes(normalizedQuery));
  }, [bookings, query]);

  const verify = async (id: string, decision: "approved" | "rejected") => {
    setBusyId(id);
    setError("");
    try {
      await api(`/api/admin/bookings/${id}/verify`, { method: "POST", body: JSON.stringify({ decision }) });
      setSelected(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update booking");
    } finally {
      setBusyId("");
    }
  };

  return (
    <div className="admin-page">
      <section className="page-title admin-page-title"><div><div className="eyebrow">Operations desk</div><h1>Bookings.</h1><p>Review payment proof and keep every reading moving toward its next step.</p></div><div className="admin-title-meta"><span>{visibleBookings.length} visible</span><button className="button-secondary" onClick={load} disabled={loading}><Icon name="arrow" size={15} /> Refresh</button></div></section>
      {error && <div className="inline-error" role="alert"><span>{error}</span><button className="ghost-button" onClick={load}>Try again</button></div>}
      <GlassCard className="admin-filter-card"><div className="admin-filter-row"><label className="admin-search"><Icon name="search" size={17} /><span className="sr-only">Search bookings</span><input className="search-input" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search customer, reading, or transaction" /></label><label className="admin-status-filter"><span>Status</span><select className="search-input" value={status} onChange={(event) => setStatus(event.target.value)}><option value="">All statuses</option><option value="pending_payment">Pending payment</option><option value="confirmed">Confirmed</option><option value="completed">Completed</option><option value="rejected">Rejected</option></select></label></div></GlassCard>
      <GlassCard className="admin-table-card"><div className="table-wrap">{loading ? <Spinner label="Loading bookings…" /> : visibleBookings.length === 0 ? <div className="admin-empty-state"><span className="admin-empty-icon"><Icon name="search" size={22} /></span><h3>{bookings.length === 0 ? "No bookings yet." : "No matching bookings."}</h3><p>{bookings.length === 0 ? "Customer bookings will appear here when they are submitted." : "Try clearing the search or choosing another status."}</p></div> : <>
        <table><thead><tr><th>Customer</th><th>Reading</th><th>Appointment</th><th>Amount</th><th>Status</th><th>Decision</th></tr></thead><tbody>{visibleBookings.map((booking) => <tr key={booking.id}><td><button className="table-link" type="button" onClick={() => setSelected(booking)}><strong>{booking.customer}</strong><small>{booking.transactionId ?? "No transaction submitted"}</small></button></td><td><span className="table-primary">{readingTypeLabel(booking.readingTypeId, booking.readingType?.title)}</span><small>{sessionFormatLabel(booking.sessionFormatId)}</small></td><td>{booking.slot ? <><span className="table-primary">{dateLabel(booking.slot.date)}</span><small>{booking.slot.startTime}–{booking.slot.endTime}</small></> : "—"}</td><td>{money(booking.amount)}</td><td><StatusBadge status={booking.status} /></td><td>{booking.status === "pending_payment" ? <div className="admin-decision-actions"><button className="button compact-button" disabled={busyId === booking.id} onClick={() => void verify(booking.id, "approved")}><Icon name="check" size={14} /> Approve</button><button className="button-secondary compact-button" disabled={busyId === booking.id} onClick={() => void verify(booking.id, "rejected")}>Reject</button></div> : <button className="text-button" type="button" onClick={() => setSelected(booking)}>View details</button>}</td></tr>)}</tbody></table>
        <div className="mobile-booking-cards">{visibleBookings.map((booking) => <article className="mobile-booking-card" key={booking.id}>
          <button className="mobile-booking-card-head" type="button" onClick={() => setSelected(booking)}><span><strong>{booking.customer}</strong><small>{booking.transactionId ?? "No transaction submitted"}</small></span><StatusBadge status={booking.status} /></button>
          <dl className="mobile-booking-card-grid"><div><dt>Reading</dt><dd>{readingTypeLabel(booking.readingTypeId, booking.readingType?.title)}</dd></div><div><dt>Format</dt><dd>{sessionFormatLabel(booking.sessionFormatId)}</dd></div><div><dt>Appointment</dt><dd>{booking.slot ? `${dateLabel(booking.slot.date)} · ${booking.slot.startTime}–${booking.slot.endTime}` : "Not scheduled"}</dd></div><div><dt>Amount</dt><dd>{money(booking.amount)}</dd></div></dl>
          <div className="mobile-booking-card-actions">{booking.status === "pending_payment" ? <><button className="button compact-button" disabled={busyId === booking.id} onClick={() => void verify(booking.id, "approved")}><Icon name="check" size={14} /> Approve</button><button className="button-secondary compact-button" disabled={busyId === booking.id} onClick={() => void verify(booking.id, "rejected")}>Reject</button></> : <button className="button-secondary compact-button" type="button" onClick={() => setSelected(booking)}>View details</button>}</div>
        </article>)}</div>
      </>}</div></GlassCard>
      <BookingDetailDrawer booking={selected} busy={Boolean(selected && busyId === selected.id)} onClose={() => setSelected(null)} onVerify={(decision) => { if (selected) void verify(selected.id, decision); }} />
    </div>
  );
}
