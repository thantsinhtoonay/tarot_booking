"use client";

import { useEffect, useState } from "react";
import { api, dateLabel, money } from "@/lib/client";
import type { BookingStatus } from "@/types";
import { GlassCard } from "@/components/GlassCard";
import { Spinner } from "@/components/Spinner";
import { StatusBadge } from "@/components/StatusBadge";

type AdminBooking = { id: string; customer: string; readingTypeId: string; sessionFormatId: string; amount: number; status: BookingStatus; transactionId?: string; slot?: { date: string; startTime: string; endTime: string } };

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const load = () => { setLoading(true); void api<AdminBooking[]>(`/api/admin/bookings${status ? `?status=${status}` : ""}`).then(setBookings).catch((err) => setError(err instanceof Error ? err.message : "Unable to load bookings")).finally(() => setLoading(false)); };
  useEffect(load, [status]);
  const verify = async (id: string, decision: "approved" | "rejected") => { setError(""); try { await api(`/api/admin/bookings/${id}/verify`, { method: "POST", body: JSON.stringify({ decision }) }); load(); } catch (err) { setError(err instanceof Error ? err.message : "Unable to update booking"); } };
  return <div><div className="page-title"><div><div className="eyebrow">Operations</div><h1>Bookings.</h1><p>Review payment proof and keep each reading moving toward its next step.</p></div><select className="search-input" style={{ width: "auto" }} value={status} onChange={(e) => setStatus(e.target.value)}><option value="">All statuses</option><option value="pending_payment">Pending payment</option><option value="confirmed">Confirmed</option><option value="completed">Completed</option><option value="rejected">Rejected</option></select></div>{error && <div className="inline-error">{error}</div>}<GlassCard><div className="table-wrap">{loading ? <Spinner label="Loading bookings…" /> : <table><thead><tr><th>Customer</th><th>Reading</th><th>Appointment</th><th>Amount</th><th>Status</th><th>Action</th></tr></thead><tbody>{bookings.map((booking) => <tr key={booking.id}><td><strong>{booking.customer}</strong><br /><small>{booking.transactionId ?? "No transaction yet"}</small></td><td>{booking.readingTypeId} · {booking.sessionFormatId}</td><td>{booking.slot ? `${dateLabel(booking.slot.date)} ${booking.slot.startTime}` : "—"}</td><td>{money(booking.amount)}</td><td><StatusBadge status={booking.status} /></td><td>{booking.status === "pending_payment" ? <span style={{ display: "flex", gap: ".4rem" }}><button className="button" style={{ minHeight: 34, padding: ".35rem .6rem", fontSize: ".7rem" }} onClick={() => void verify(booking.id, "approved")}>Approve</button><button className="button-secondary" style={{ minHeight: 34, padding: ".35rem .6rem", fontSize: ".7rem" }} onClick={() => void verify(booking.id, "rejected")}>Reject</button></span> : "—"}</td></tr>)}</tbody></table>}</div></GlassCard></div>;
}
