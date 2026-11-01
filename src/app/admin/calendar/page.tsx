"use client";

import { useEffect, useMemo, useState } from "react";
import { api, dateLabel } from "@/lib/client";
import { GlassCard } from "@/components/GlassCard";
import { Icon } from "@/components/Icon";
import { Spinner } from "@/components/Spinner";

type AdminBooking = { id: string; customer: string; readingTypeId: string; status: "pending_payment" | "confirmed" | "completed" | "rejected"; slot?: { date: string; startTime: string; endTime: string } };

const weekdayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function CalendarPage() {
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [month, setMonth] = useState(() => new Date());

  const load = () => {
    setLoading(true);
    setError("");
    void api<AdminBooking[]>("/api/admin/bookings")
      .then(setBookings)
      .catch((err) => setError(err instanceof Error ? err.message : "Unable to load the calendar"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const days = useMemo(() => {
    const first = new Date(month.getFullYear(), month.getMonth(), 1);
    const start = new Date(first);
    start.setDate(1 - first.getDay());
    return Array.from({ length: 42 }, (_, index) => {
      const date = new Date(start);
      date.setDate(start.getDate() + index);
      return date;
    });
  }, [month]);

  const key = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  const todayKey = key(new Date());
  const monthLabel = new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(month);

  if (loading) return <Spinner label="Loading calendar…" />;

  return (
    <div className="admin-page">
      <section className="page-title admin-page-title"><div><div className="eyebrow">Schedule</div><h1>Calendar.</h1><p>See the rhythm of readings across the month at a glance.</p></div><button className="button-secondary" onClick={load} disabled={loading}><Icon name="arrow" size={15} /> Refresh</button></section>
      {error && <div className="inline-error" role="alert"><span>{error}</span><button className="ghost-button" onClick={load}>Try again</button></div>}
      <GlassCard className="admin-calendar-card"><div className="calendar-toolbar"><div><span className="eyebrow">Reading schedule</span><h2>{monthLabel}</h2></div><div className="calendar-controls"><button className="icon-button" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))} aria-label="Previous month"><Icon name="chevron" size={18} /></button><button className="button-secondary calendar-today" onClick={() => setMonth(new Date())}>Today</button><button className="icon-button calendar-next" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))} aria-label="Next month"><Icon name="chevron" size={18} /></button></div></div><div className="calendar-weekdays">{weekdayLabels.map((day) => <span key={day}>{day}</span>)}</div><div className="calendar-grid admin-calendar-grid">{days.map((date) => { const dateKey = key(date); const items = bookings.filter((booking) => booking.slot?.date === dateKey); const outside = date.getMonth() !== month.getMonth(); return <div className={`calendar-cell admin-calendar-cell ${outside ? "muted" : ""} ${dateKey === todayKey ? "today" : ""}`} key={dateKey}><small>{date.getDate()}</small>{items.map((booking) => <span className={`calendar-event status-event-${booking.status}`} key={booking.id}><b>{booking.slot?.startTime}</b> {booking.customer}</span>)}</div>; })}</div></GlassCard><div className="calendar-footer"><span><i className="calendar-dot dot-pending" /> Pending payment</span><span><i className="calendar-dot dot-confirmed" /> Confirmed</span><span><i className="calendar-dot dot-rejected" /> Rejected</span><span className="muted">{bookings.length} booking{bookings.length === 1 ? "" : "s"} in total</span></div><p className="sr-only">Current month: {dateLabel(`${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, "0")}-01`)}</p>
    </div>
  );
}
