"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";
import { api } from "@/lib/client";
import type { User } from "@/types";
import { Icon } from "@/components/Icon";
import { Logo } from "@/components/Logo";
import { Spinner } from "@/components/Spinner";

type Portal = "customer" | "admin";

export function AppShell({ children, portal = "customer" }: { children: ReactNode; portal?: Portal }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [drawer, setDrawer] = useState(false);
  const [error, setError] = useState("");

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

  if (loading) return <Spinner label="Checking your session…" />;
  if (!user) return null;
  if (portal === "admin" && user.role !== "admin") return null;

  const nav = portal === "admin"
    ? [{ href: "/admin", label: "Overview", icon: "home" as const }, { href: "/admin/calendar", label: "Calendar", icon: "calendar" as const }, { href: "/admin/bookings", label: "Bookings", icon: "plus" as const }, { href: "/admin/daily", label: "Daily post", icon: "sparkle" as const }]
    : [{ href: "/dashboard", label: "Home", icon: "home" as const }, { href: "/dashboard/book", label: "Book", icon: "plus" as const }, { href: "/dashboard/about", label: "About", icon: "moon" as const }, { href: "/dashboard/profile", label: "Profile", icon: "user" as const }];
  const active = (href: string) => href === "/dashboard" || href === "/admin" ? pathname === href : pathname.startsWith(href);
  const logout = async () => {
    setError("");
    try { await api<null>("/api/auth/logout", { method: "POST" }); router.replace("/login"); } catch (err) { setError(err instanceof Error ? err.message : "Unable to sign out"); }
  };

  return (
    <div className="app-frame">
      <header className="topbar">
        <div className="page-width topbar-inner">
          <button className="icon-button mobile-only" onClick={() => setDrawer(true)} aria-label="Open menu"><Icon name="menu" /></button>
          <Logo />
          <div className="topbar-actions"><span className="portal-label">{portal === "admin" ? "Astrologer portal" : "Customer portal"}</span><span className="user-name">{user.name}</span><button className="text-button" onClick={() => void logout()}><Icon name="logout" size={16} /> Sign out</button></div>
        </div>
      </header>
      <div className="page-width shell-grid">
        <aside className={`sidebar ${drawer ? "drawer-open" : ""}`}>
          <div className="sidebar-head"><Logo compact /><button className="icon-button mobile-only" onClick={() => setDrawer(false)} aria-label="Close menu"><Icon name="x" /></button></div>
          <nav className="side-nav">{nav.map((item) => <Link key={item.href} href={item.href} onClick={() => setDrawer(false)} className={active(item.href) ? "active" : ""}><Icon name={item.icon} size={18} /><span>{item.label}</span></Link>)}</nav>
          <div className="sidebar-note"><Icon name="sparkle" size={18} /><p>{portal === "admin" ? "Keep readings calm, clear, and personal." : "A quiet space for your next insight."}</p></div>
        </aside>
        {drawer && <button className="drawer-scrim mobile-only" onClick={() => setDrawer(false)} aria-label="Close menu" />}
        <main className="main-content">{error && <div className="inline-error">{error}</div>}{children}</main>
      </div>
      <nav className="bottom-nav mobile-only" aria-label="Primary navigation">{nav.map((item) => <Link key={item.href} href={item.href} className={active(item.href) ? "active" : ""}><Icon name={item.icon} size={20} /><span>{item.label}</span></Link>)}</nav>
    </div>
  );
}
