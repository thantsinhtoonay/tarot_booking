"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";
import { api } from "@/lib/client";
import type { User } from "@/types";
import { Icon } from "@/components/Icon";
import { Logo } from "@/components/Logo";
import { Spinner } from "@/components/Spinner";
import { LanguageToggle, useLanguage } from "@/components/LanguageProvider";

type Portal = "customer" | "admin";

export function AppShell({ children, portal = "customer" }: { children: ReactNode; portal?: Portal }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [drawer, setDrawer] = useState(false);
  const [error, setError] = useState("");
  const { t } = useLanguage();
  const labels = portal === "admin" ? { overview: "Overview", calendar: "Calendar", availability: "Availability", bookings: "Bookings", services: "Services", daily: "Daily message", home: "Home", book: "Book", about: "About", profile: "Profile", signOut: "Sign out", customerNote: "A quiet space for your next insight." } : t;

  useEffect(() => {
    void api<User>("/api/auth/me").then(setUser).catch(() => router.replace(portal === "admin" ? "/admin/login" : "/login")).finally(() => setLoading(false));
  }, [portal, router]);

  useEffect(() => {
    if (!loading && user && portal === "admin" && user.role !== "admin") {
      router.replace("/dashboard");
      return;
    }
    if (!loading && user && portal === "customer" && user.role === "admin") {
      router.replace("/admin");
    }
  }, [loading, portal, router, user]);

  if (loading) return <Spinner label={portal === "admin" ? "Checking your session…" : t.checkingSession} />;
  if (!user) return null;
  if (portal === "admin" && user.role !== "admin") return null;

  const nav = portal === "admin"
    ? [{ href: "/admin", label: labels.overview, icon: "home" as const }, { href: "/admin/calendar", label: labels.calendar, icon: "calendar" as const }, { href: "/admin/availability", label: labels.availability, icon: "clock" as const }, { href: "/admin/bookings", label: labels.bookings, icon: "plus" as const }, { href: "/admin/services", label: labels.services, icon: "sparkle" as const }, { href: "/admin/daily", label: labels.daily, icon: "sparkle" as const }]
    : [{ href: "/dashboard", label: labels.home, icon: "home" as const }, { href: "/dashboard/book", label: labels.book, icon: "plus" as const }, { href: "/dashboard/about", label: labels.about, icon: "moon" as const }, { href: "/dashboard/profile", label: labels.profile, icon: "user" as const }];
  const active = (href: string) => href === "/dashboard" || href === "/admin" ? pathname === href : pathname.startsWith(href);
  const logout = async () => {
    setError("");
    try { await api<null>("/api/auth/logout", { method: "POST" }); router.replace("/login"); } catch (err) { setError(err instanceof Error ? err.message : portal === "admin" ? "Unable to sign out" : t.unableSignOut); }
  };

  return (
    <div className="app-frame">
      <header className="topbar">
        <div className="page-width topbar-inner">
          <button className="icon-button mobile-only" onClick={() => setDrawer(true)} aria-label={portal === "admin" ? "Open menu" : t.openMenu}><Icon name="menu" /></button>
          <Logo />
          <div className="topbar-actions"><span className="user-name">{user.name}</span>{portal === "customer" && <LanguageToggle />}<button className="text-button" onClick={() => void logout()}><Icon name="logout" size={16} /> {labels.signOut}</button></div>
        </div>
      </header>
      <div className="page-width shell-grid">
        <aside className={`sidebar ${drawer ? "drawer-open" : ""}`}>
          <div className="sidebar-head"><Logo compact /><button className="icon-button mobile-only" onClick={() => setDrawer(false)} aria-label={portal === "admin" ? "Close menu" : t.closeMenu}><Icon name="x" /></button></div>
          <nav className="side-nav">{nav.map((item) => <Link key={item.href} href={item.href} onClick={() => setDrawer(false)} className={active(item.href) ? "active" : ""}><Icon name={item.icon} size={18} /><span>{item.label}</span></Link>)}</nav>
          <div className="sidebar-note"><Icon name="sparkle" size={18} /><p>{portal === "admin" ? "Keep readings calm, clear, and personal." : labels.customerNote}</p></div>
        </aside>
        {drawer && <button className="drawer-scrim mobile-only" onClick={() => setDrawer(false)} aria-label={portal === "admin" ? "Close menu" : t.closeMenu} />}
        <main className="main-content">{error && <div className="inline-error" role="alert">{error}</div>}{children}</main>
      </div>
      <nav className="bottom-nav mobile-only" aria-label={portal === "admin" ? "Primary navigation" : t.home}>{nav.map((item) => <Link key={item.href} href={item.href} className={active(item.href) ? "active" : ""}><Icon name={item.icon} size={20} /><span>{item.label}</span></Link>)}</nav>
    </div>
  );
}
