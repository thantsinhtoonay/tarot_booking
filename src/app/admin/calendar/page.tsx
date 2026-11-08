"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { api, dateLabel } from "@/lib/client";
import { BookingDetailDrawer, type AdminBookingDetail } from "@/components/BookingDetailDrawer";
import { GlassCard } from "@/components/GlassCard";
import { Icon } from "@/components/Icon";
import { Spinner } from "@/components/Spinner";

type AdminBooking = AdminBookingDetail;
type CalendarView = "month" | "week";
const weekdayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function CalendarPage() {
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [focusDate, setFocusDate] = useState(() => new Date());
  const [view, setView] = useState<CalendarView>("month");
  const [selected, setSelected] = useState<AdminBooking | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try { setBookings(await api<AdminBooking[]>("/api/admin/bookings")); }
    catch (err) { setError(err instanceof Error ? err.message : "Unable to load the calendar"); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { void load(); }, [load]);

  const key = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  const todayKey = key(new Date());
  const days = useMemo(() => {
    if (view === "week") {
      const start = new Date(focusDate); start.setDate(start.getDate() - start.getDay());
      return Array.from({ length: 7 }, (_, index) => { const date = new Date(start); date.setDate(start.getDate() + index); return date; });
    }
    const first = new Date(focusDate.getFullYear(), focusDate.getMonth(), 1); const start = new Date(first); start.setDate(1 - first.getDay());
    return Array.from({ length: 42 }, (_, index) => { const date = new Date(start); date.setDate(start.getDate() + index); return date; });
  }, [focusDate, view]);
  const rangeLabel = view === "month" ? new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(focusDate) : `${dateLabel(key(days[0]))} – ${dateLabel(key(days[days.length - 1]))}`;
  const shift = (direction: number) => { const next = new Date(focusDate); if (view === "month") next.setMonth(next.getMonth() + direction, 1); else next.setDate(next.getDate() + direction * 7); setFocusDate(next); };

  if (loading) return <Spinner label="Loading calendar…" />;
  return (
    <div className="admin-page">
      <section className="page-title admin-page-title"><div><div className="eyebrow">Schedule</div><h1>Calendar.</h1><p>See the rhythm of readings across the month or focus on the week ahead.</p></div><button className="button-secondary" type="button" onClick={() => void load()} disabled={loading}><Icon name="arrow" size={15} /> Refresh</button></section>
      {error && <div className="inline-error" role="alert"><span>{error}</span><button className="ghost-button" type="button" onClick={() => void load()}>Try again</button></div>}
      <GlassCard className="admin-calendar-card">
        <div className="calendar-toolbar"><div><span className="eyebrow">Reading schedule</span><h2>{rangeLabel}</h2></div><div className="calendar-controls"><div className="calendar-view-toggle" role="group" aria-label="Calendar view"><button className={view === "month" ? "active" : ""} type="button" aria-pressed={view === "month"} onClick={() => setView("month")}>Month</button><button className={view === "week" ? "active" : ""} type="button" aria-pressed={view === "week"} onClick={() => setView("week")}>Week</button></div><button className="icon-button" type="button" onClick={() => shift(-1)} aria-label="Previous period"><Icon name="chevron" size={18} /></button><button className="button-secondary calendar-today" type="button" onClick={() => setFocusDate(new Date())}>Today</button><button className="icon-button calendar-next" type="button" onClick={() => shift(1)} aria-label="Next period"><Icon name="chevron" size={18} /></button></div></div>
        <div className="calendar-weekdays">{weekdayLabels.map((day) => <span key={day}>{day}</span>)}</div>
        <div className={`calendar-grid admin-calendar-grid ${view === "week" ? "calendar-week-view" : ""}`}>{days.map((date) => { const dateKey = key(date); const items = bookings.filter((booking) => booking.slot?.date === dateKey); const outside = view === "month" && date.getMonth() !== focusDate.getMonth(); return <div className={`calendar-cell admin-calendar-cell ${outside ? "muted" : ""} ${dateKey === todayKey ? "today" : ""}`} key={dateKey}><small>{date.getDate()}</small>{items.map((booking) => <button className={`calendar-event status-event-${booking.status}`} type="button" key={booking.id} onClick={() => setSelected(booking)}><b>{booking.slot?.startTime}</b> {booking.customer}</button>)}</div>; })}</div>
      </GlassCard>
      <div className="calendar-footer"><span><i className="calendar-dot dot-pending" /> Pending payment</span><span><i className="calendar-dot dot-confirmed" /> Confirmed</span><span><i className="calendar-dot dot-rejected" /> Rejected</span><span className="muted">{bookings.length} booking{bookings.length === 1 ? "" : "s"} in total</span></div>
      <p className="sr-only">Current period: {rangeLabel}</p>
      <BookingDetailDrawer booking={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
