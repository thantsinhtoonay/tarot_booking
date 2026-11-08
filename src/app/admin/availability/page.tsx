"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { GlassCard } from "@/components/GlassCard";
import { Icon } from "@/components/Icon";
import { Spinner } from "@/components/Spinner";
import { api } from "@/lib/client";
import type { AvailabilitySettings, DateRule, TimeSlot } from "@/types";

type ManagedSlot = TimeSlot & { isReserved?: boolean };
type AvailabilityData = { settings: AvailabilitySettings; dateRules: DateRule[]; slots: ManagedSlot[] };

const defaultSettings: AvailabilitySettings = { startTime: "09:00", endTime: "20:00", slotDurationMin: 30, defaultOpen: true };

function todayInput() {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export default function AvailabilityPage() {
  const [data, setData] = useState<AvailabilityData | null>(null);
  const [settings, setSettings] = useState<AvailabilitySettings>(defaultSettings);
  const [selectedDate, setSelectedDate] = useState(todayInput());
  const [dateStatus, setDateStatus] = useState<"open" | "closed">("closed");
  const [dateNote, setDateNote] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const result = await api<AvailabilityData>("/api/admin/availability");
      setData(result);
      setSettings(result.settings);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load availability settings");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const selectedRule = data?.dateRules.find((rule) => rule.date === selectedDate);
  const selectedSlots = useMemo(() => data?.slots.filter((slot) => slot.date === selectedDate) ?? [], [data, selectedDate]);

  const saveSettings = async () => {
    setSaving(true);
    setError("");
    setMessage("");
    try {
      await api<AvailabilitySettings>("/api/admin/availability", { method: "PUT", body: JSON.stringify(settings) });
      await load();
      setMessage("Operating hours saved.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save operating hours");
    } finally {
      setSaving(false);
    }
  };

  const saveDateRule = async () => {
    setSaving(true);
    setError("");
    setMessage("");
    try {
      await api<DateRule>("/api/admin/availability", { method: "POST", body: JSON.stringify({ action: "dateRule", date: selectedDate, status: dateStatus, note: dateNote }) });
      await load();
      setMessage(`${selectedDate} marked ${dateStatus}.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save date rule");
    } finally {
      setSaving(false);
    }
  };

  const removeDateRule = async (date: string) => {
    setSaving(true);
    setError("");
    try {
      await api(`/api/admin/availability?date=${encodeURIComponent(date)}`, { method: "DELETE" });
      await load();
      setMessage(`${date} now follows the default schedule.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to remove date rule");
    } finally {
      setSaving(false);
    }
  };

  const toggleSlot = async (slot: ManagedSlot) => {
    setSaving(true);
    setError("");
    try {
      await api("/api/admin/availability", { method: "POST", body: JSON.stringify({ action: "slot", slotId: slot.id, blocked: !slot.isBlocked }) });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update time slot");
    } finally {
      setSaving(false);
    }
  };

  if (loading || !data) return <Spinner label="Loading availability settings…" />;

  return (
    <div className="admin-page">
      <section className="page-title admin-page-title"><div><div className="eyebrow">Schedule controls</div><h1>Availability.</h1><p>Set your working hours, open dates, holidays, and individual time windows.</p></div><button className="button-secondary" type="button" onClick={() => void load()} disabled={saving}><Icon name="arrow" size={15} /> Refresh</button></section>
      {error && <div className="inline-error" role="alert"><span>{error}</span><button className="ghost-button" type="button" onClick={() => void load()}>Try again</button></div>}
      {message && <div className="inline-success" role="status"><Icon name="check" size={16} /> {message}</div>}

      <div className="availability-management-grid">
        <GlassCard>
          <div className="admin-card-heading"><div><span className="eyebrow">Default schedule</span><h2>Working hours.</h2></div><span className="admin-step-badge">01</span></div>
          <p className="muted availability-card-intro">These hours generate the selectable slots for every date unless a date rule changes it.</p>
          <div className="form availability-form">
            <div className="choice-grid">
              <div className="field"><label htmlFor="availability-start">Start time</label><input id="availability-start" type="time" value={settings.startTime} onChange={(event) => setSettings((current) => ({ ...current, startTime: event.target.value }))} /></div>
              <div className="field"><label htmlFor="availability-end">End time</label><input id="availability-end" type="time" value={settings.endTime} onChange={(event) => setSettings((current) => ({ ...current, endTime: event.target.value }))} /></div>
            </div>
            <div className="field"><label htmlFor="availability-duration">Default slot duration</label><select id="availability-duration" value={settings.slotDurationMin} onChange={(event) => setSettings((current) => ({ ...current, slotDurationMin: Number(event.target.value) }))}><option value={15}>15 minutes</option><option value={30}>30 minutes</option><option value={45}>45 minutes</option><option value={60}>60 minutes</option><option value={90}>90 minutes</option><option value={120}>120 minutes</option></select></div>
            <label className="availability-toggle"><input type="checkbox" checked={settings.defaultOpen} onChange={(event) => setSettings((current) => ({ ...current, defaultOpen: event.target.checked }))} /><span><strong>Open dates by default</strong><small>Turn this off if you want to open dates one by one.</small></span></label>
            <button className="button" type="button" onClick={() => void saveSettings()} disabled={saving}>{saving ? "Saving…" : "Save schedule"}</button>
          </div>
        </GlassCard>

        <GlassCard>
          <div className="admin-card-heading"><div><span className="eyebrow">Date controls</span><h2>Open or close a date.</h2></div><span className="admin-step-badge">02</span></div>
          <p className="muted availability-card-intro">Use an open rule for an exceptional working day or a closed rule for a holiday or day off.</p>
          <div className="form availability-form">
            <div className="field"><label htmlFor="availability-date">Date</label><input id="availability-date" type="date" min={todayInput()} value={selectedDate} onChange={(event) => setSelectedDate(event.target.value)} /></div>
            <div className="field"><label htmlFor="availability-status">Date status</label><select id="availability-status" value={dateStatus} onChange={(event) => setDateStatus(event.target.value as "open" | "closed")}><option value="open">Open / operational</option><option value="closed">Closed / unavailable</option></select></div>
            <div className="field"><label htmlFor="availability-note">Note <span className="muted">(optional)</span></label><input id="availability-note" value={dateNote} onChange={(event) => setDateNote(event.target.value)} placeholder="Holiday, special opening…" /></div>
            <button className="button-secondary" type="button" onClick={() => void saveDateRule()} disabled={saving}>{saving ? "Saving…" : "Save date rule"}</button>
          </div>
          {selectedRule && <div className="availability-current-rule"><span className={`availability-status ${selectedRule.status}`}>{selectedRule.status}</span><span>{selectedRule.note || "Custom date rule"}</span><button className="text-button" type="button" onClick={() => void removeDateRule(selectedRule.date)} disabled={saving}>Reset</button></div>}
        </GlassCard>
      </div>

      <GlassCard>
        <div className="section-heading admin-section-heading"><div><span className="eyebrow">Time slot controls</span><h2>Block or reopen a window.</h2><p>Select a date to manage individual slots. Reserved slots are protected.</p></div><div className="availability-date-picker"><label htmlFor="slot-date">Manage date</label><input id="slot-date" type="date" min={todayInput()} value={selectedDate} onChange={(event) => setSelectedDate(event.target.value)} /></div></div>
        {selectedSlots.length === 0 ? <div className="admin-empty-state"><span className="admin-empty-icon"><Icon name="clock" size={22} /></span><h3>No generated slots for this date.</h3><p>Check the date rule and default schedule above.</p></div> : <div className="availability-slot-list">{selectedSlots.map((slot) => <div className={`availability-slot-row ${slot.isBlocked ? "blocked" : ""}`} key={slot.id}><div><strong>{slot.startTime}–{slot.endTime}</strong><small>{slot.isReserved ? "Reserved by a customer" : slot.isBlocked ? "Blocked manually" : "Available to customers"}</small></div><button className={slot.isBlocked ? "button" : "button-secondary"} type="button" onClick={() => void toggleSlot(slot)} disabled={saving || Boolean(slot.isReserved)}>{slot.isBlocked ? "Open slot" : "Block slot"}</button></div>)}</div>}
      </GlassCard>
    </div>
  );
}
