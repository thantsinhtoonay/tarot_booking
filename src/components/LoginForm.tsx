"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/client";
import type { User } from "@/types";
import { Logo } from "@/components/Logo";
import { LanguageToggle, useLanguage } from "@/components/LanguageProvider";

type LoginPortal = "customer" | "admin";

export function LoginForm({ portal = "customer" }: { portal?: LoginPortal }) {
  const router = useRouter();
  const isAdmin = portal === "admin";
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError("");

    try {
      const user = await api<User>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      if (isAdmin && user.role !== "admin") {
        await api<null>("/api/auth/logout", { method: "POST" });
        throw new Error(isAdmin ? "This account does not have astrologer portal access." : t.accountRoleError);
      }

      router.replace(user.role === "admin" ? "/admin" : "/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : t.unableSignIn);
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="auth-page">
      <section className={`glass-card auth-card ${isAdmin ? "admin-auth-card" : ""}`}>
        <div className="auth-card-top"><Logo />{!isAdmin && <LanguageToggle />}</div>
        <div className="auth-kicker">{isAdmin ? "Private astrologer workspace" : t.privateReadingSpace}</div>
        <h1>{isAdmin ? "Astrologer sign in." : t.authWelcome}</h1>
        <p>{isAdmin ? "Review readings, confirm payments, and publish the daily message from one calm workspace." : t.authDescription}</p>
        <form className="form" onSubmit={submit}>
          <div className="field">
            <label htmlFor="email">{t.emailAddress}</label>
            <input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required autoComplete="email" />
          </div>
          <div className="field">
            <label htmlFor="password">{t.password}</label>
            <input id="password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required autoComplete={isAdmin ? "current-password" : "current-password"} />
          </div>
          {error && <p className="form-message" role="alert">{error}</p>}
          <button className="button" disabled={busy}>{busy ? t.checkingAccess : isAdmin ? "Enter astrologer portal" : t.signIn}</button>
        </form>
        {isAdmin ? (
          <p className="auth-switch">Customer account? <Link href="/login">{t.useCustomerSignIn}</Link></p>
        ) : (
          <p className="auth-switch">{t.newToBhoneThaw} <Link href="/register">{t.createAccount}</Link></p>
        )}
      </section>
    </main>
  );
}
