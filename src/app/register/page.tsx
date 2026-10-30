"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/client";
import { Logo } from "@/components/Logo";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const set = (key: keyof typeof form) => (event: React.ChangeEvent<HTMLInputElement>) => setForm((value) => ({ ...value, [key]: event.target.value }));
  const submit = async (event: FormEvent) => {
    event.preventDefault(); setBusy(true); setError("");
    try { await api("/api/auth/register", { method: "POST", body: JSON.stringify(form) }); router.push("/dashboard"); }
    catch (err) { setError(err instanceof Error ? err.message : "Unable to create account"); } finally { setBusy(false); }
  };
  return <main className="auth-page"><section className="glass-card auth-card"><Logo /><h1>Make space for clarity.</h1><p>Create your private reading space and start with the question that matters.</p><form className="form" onSubmit={submit}><div className="field"><label htmlFor="name">Your name</label><input id="name" value={form.name} onChange={set("name")} required autoComplete="name" /></div><div className="field"><label htmlFor="email">Email address</label><input id="email" type="email" value={form.email} onChange={set("email")} required autoComplete="email" /></div><div className="field"><label htmlFor="phone">Phone number <span className="muted">(optional)</span></label><input id="phone" value={form.phone} onChange={set("phone")} autoComplete="tel" /></div><div className="field"><label htmlFor="password">Password</label><input id="password" type="password" minLength={8} value={form.password} onChange={set("password")} required autoComplete="new-password" /></div>{error && <p className="form-message">{error}</p>}<button className="button" disabled={busy}>{busy ? "Creating your space…" : "Create account"}</button></form><p className="auth-switch">Already have an account? <Link href="/login">Sign in</Link></p></section></main>;
}
