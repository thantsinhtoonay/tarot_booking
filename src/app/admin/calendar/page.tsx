"use client";

import { useEffect, useMemo, useState } from "react";
import { api, dateLabel } from "@/lib/client";
import { GlassCard } from "@/components/GlassCard";
import { Spinner } from "@/components/Spinner";

type AdminBooking = {
  id: string;
  customer: string;
  readingTypeId: string;
  status: "pending_payment" | "confirmed" | "completed" | "rejected";
  slot?: { date: string; startTime: string; endTime: string };
};

export default function CalendarPage() {
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState(() => new Date());

  useEffect(() => {
    void api<AdminBooking[]>("/api/admin/bookings")
      .then(setBookings)
      .finally(() => setLoading(false));
  }, []);

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

  if (loading) return <Spinner label="Loading calendar…" />;

  const key = (date: Date) => date.toISOString().slice(0, 10);

  return (
    <div>
      <div className="page-title">
        <div>
          <div className="eyebrow">Schedule</div>
          <h1>Calendar.</h1>
          <p>See the rhythm of readings across the month at a glance.</p>
        </div>
        <div style={{ display: "flex", gap: ".5rem" }}>
          <button className="button-secondary" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}>Previous</button>
          <button className="button-secondary" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}>Next</button>
        </div>
      </div>
      <GlassCard>
        <div className="calendar-grid">
          {days.map((date) => {
            const dateKey = key(date);
            const items = bookings.filter((booking) => booking.slot?.date === dateKey);
            const outside = date.getMonth() !== month.getMonth();
            return (
              <div className={`calendar-cell ${outside ? "muted" : ""} ${dateKey === key(new Date()) ? "today" : ""}`} key={dateKey}>
                <small>{date.getDate()}</small>
                {items.map((booking) => (
                  <span className="calendar-event" key={booking.id}>
                    {booking.slot?.startTime} · {booking.customer}
                  </span>
                ))}
              </div>
            );
          })}
        </div>
      </GlassCard>
      <p className="muted" style={{ marginTop: ".8rem", fontSize: ".75rem" }}>
        {dateLabel(`${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, "0")}-01`)}
      </p>
    </div>
  );
}
