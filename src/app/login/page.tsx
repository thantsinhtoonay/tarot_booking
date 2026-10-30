"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/client";
import { Logo } from "@/components/Logo";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const submit = async (event: FormEvent) => {
    event.preventDefault(); setBusy(true); setError("");
    try { await api("/api/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }); router.push("/dashboard"); }
    catch (err) { setError(err instanceof Error ? err.message : "Unable to sign in"); } finally { setBusy(false); }
  };
  return <main className="auth-page"><section className="glass-card auth-card"><Logo /><h1>Welcome back.</h1><p>Return to your reading space and follow what is unfolding.</p><form className="form" onSubmit={submit}><div className="field"><label htmlFor="email">Email address</label><input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" /></div><div className="field"><label htmlFor="password">Password</label><input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" /></div>{error && <p className="form-message">{error}</p>}<button className="button" disabled={busy}>{busy ? "Signing in…" : "Sign in"}</button></form><p className="auth-switch">New to Bhone Thaw-Tarot? <Link href="/register">Create an account</Link></p></section></main>;
}
