"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { api, money } from "@/lib/client";
import { GlassCard } from "@/components/GlassCard";
import { Icon } from "@/components/Icon";
import { Spinner } from "@/components/Spinner";
import type { ReadingType } from "@/types";

type ServiceForm = { title: string; description: string; price: string };

const emptyForm: ServiceForm = { title: "", description: "", price: "" };

export default function AdminServicesPage() {
  const [services, setServices] = useState<ReadingType[]>([]);
  const [form, setForm] = useState<ServiceForm>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setServices(await api<ReadingType[]>("/api/admin/services"));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load services");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const update = (key: keyof ServiceForm, value: string) => setForm((current) => ({ ...current, [key]: value }));

  const startCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setError("");
    setMessage("");
  };

  const startEdit = (service: ReadingType) => {
    setEditingId(service.id);
    setForm({ title: service.title, description: service.description, price: String(service.price) });
    setError("");
    setMessage("");
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const wasEditing = Boolean(editingId);
      await api<ReadingType>(editingId ? "/api/admin/services" : "/api/admin/services", {
        method: editingId ? "PUT" : "POST",
        body: JSON.stringify({ ...form, price: Number(form.price), ...(editingId ? { id: editingId } : {}) }),
      });
      await load();
      startCreate();
      setMessage(wasEditing ? "Service updated." : "Service created.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save service");
    } finally {
      setBusy(false);
    }
  };

  const remove = async (service: ReadingType) => {
    if (!window.confirm(`Delete “${service.title}”? This cannot be undone.`)) return;
    setBusy(true);
    setError("");
    setMessage("");
    try {
      await api(`/api/admin/services?id=${encodeURIComponent(service.id)}`, { method: "DELETE" });
      if (editingId === service.id) startCreate();
      await load();
      setMessage("Service deleted.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to delete service");
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <Spinner label="Loading service catalogue…" />;

  return (
    <div className="admin-page">
      <section className="page-title admin-page-title">
        <div><div className="eyebrow">Reading catalogue</div><h1>Services.</h1><p>Create, update, or remove the reading services customers can book.</p></div>
        <button className="button" type="button" onClick={startCreate}><Icon name="plus" size={16} /> New service</button>
      </section>

      {error && <div className="inline-error" role="alert"><span>{error}</span><button className="ghost-button" type="button" onClick={() => setError("")}>Dismiss</button></div>}
      {message && <p className="admin-success" role="status"><Icon name="check" size={15} /> {message}</p>}

      <div className="service-management-grid">
        <GlassCard className="service-management-editor">
          <div className="admin-card-heading"><div><span className="eyebrow">{editingId ? "Edit service" : "Add a service"}</span><h2>{editingId ? "Refine the offer." : "Create a new offer."}</h2></div><span className="admin-step-badge">{editingId ? "02" : "01"}</span></div>
          <form className="form" onSubmit={submit}>
            <div className="field"><label htmlFor="service-title">Service name</label><input id="service-title" value={form.title} onChange={(event) => update("title", event.target.value)} placeholder="Love reading" required /></div>
            <div className="field"><label htmlFor="service-description">Description</label><textarea id="service-description" value={form.description} onChange={(event) => update("description", event.target.value)} placeholder="Clarity for relationships and matters of the heart." required /></div>
            <div className="field"><label htmlFor="service-price">Price (MMK)</label><input id="service-price" type="number" min="1" step="1" value={form.price} onChange={(event) => update("price", event.target.value)} placeholder="15000" required /></div>
            <div className="service-form-actions"><button className="button" type="submit" disabled={busy}>{busy ? "Saving…" : editingId ? "Save changes" : "Create service"}</button>{editingId && <button className="button-secondary" type="button" onClick={startCreate} disabled={busy}>Cancel</button>}</div>
          </form>
        </GlassCard>

        <GlassCard className="service-management-list">
          <div className="section-heading admin-section-heading"><div><span className="eyebrow">Available to customers</span><h2>{services.length} {services.length === 1 ? "service" : "services"}</h2><p>These services appear in the booking flow and public catalogue.</p></div></div>
          {services.length === 0 ? <div className="admin-empty-state"><span className="admin-empty-icon"><Icon name="sparkle" size={22} /></span><h3>No services yet.</h3><p>Create the first service to open the booking catalogue.</p></div> : <div className="service-management-items">{services.map((service) => <article className="service-management-item" key={service.id}><div className="service-management-copy"><div className="service-management-item-head"><h3>{service.title}</h3><strong>{money(service.price)}</strong></div><p>{service.description}</p><small>{service.id}</small></div><div className="service-management-actions"><button className="button-secondary compact-button" type="button" onClick={() => startEdit(service)} disabled={busy}><Icon name="edit" size={14} /> Edit</button><button className="text-button service-delete-button" type="button" onClick={() => void remove(service)} disabled={busy}><Icon name="trash" size={14} /> Delete</button></div></article>)}</div>}
        </GlassCard>
      </div>
    </div>
  );
}
