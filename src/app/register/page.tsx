"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/client";
import { Logo } from "@/components/Logo";
import { LanguageToggle, useLanguage } from "@/components/LanguageProvider";

export default function RegisterPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const set = (key: keyof typeof form) => (event: React.ChangeEvent<HTMLInputElement>) => setForm((value) => ({ ...value, [key]: event.target.value }));
  const submit = async (event: FormEvent) => {
    event.preventDefault(); setBusy(true); setError("");
    try { await api("/api/auth/register", { method: "POST", body: JSON.stringify(form) }); router.push("/dashboard"); }
    catch (err) { setError(err instanceof Error ? err.message : t.unableCreateAccount); } finally { setBusy(false); }
  };
  return <main className="auth-page"><section className="glass-card auth-card"><div className="auth-card-top"><Logo /><LanguageToggle /></div><h1>{t.makeSpaceForClarity}</h1><p>{t.registerDescription}</p><form className="form" onSubmit={submit}><div className="field"><label htmlFor="name">{t.yourName}</label><input id="name" value={form.name} onChange={set("name")} required autoComplete="name" /></div><div className="field"><label htmlFor="email">{t.emailAddress}</label><input id="email" type="email" value={form.email} onChange={set("email")} required autoComplete="email" /></div><div className="field"><label htmlFor="phone">{t.phoneNumber} <span className="muted">({t.optional})</span></label><input id="phone" value={form.phone} onChange={set("phone")} autoComplete="tel" /></div><div className="field"><label htmlFor="password">{t.password}</label><input id="password" type="password" minLength={8} value={form.password} onChange={set("password")} required autoComplete="new-password" /></div>{error && <p className="form-message" role="alert">{error}</p>}<button className="button" disabled={busy}>{busy ? t.createYourSpace : t.createAccount}</button></form><p className="auth-switch">{t.alreadyHaveAccount} <Link href="/login">{t.signInLink}</Link></p></section></main>;
}
