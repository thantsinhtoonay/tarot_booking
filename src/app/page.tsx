"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { GlassCard } from "@/components/GlassCard";
import { Icon } from "@/components/Icon";
import { LanguageToggle, localizedReadingDescription, localizedReadingTitle, useLanguage } from "@/components/LanguageProvider";
import { LandingDailyMessage } from "@/components/LandingDailyMessage";
import { Logo } from "@/components/Logo";
import { api, money } from "@/lib/client";
import type { ReadingType } from "@/types";

const defaultServices: ReadingType[] = [
  { id: "love", title: "Love Reading", description: "Clarity for relationships and matters of the heart.", price: 15000 },
  { id: "career", title: "Career Reading", description: "Guidance for work, direction, and opportunity.", price: 15000 },
  { id: "overall", title: "Overall Life Reading", description: "A broad reading for your current path and energy.", price: 18000 },
  { id: "custom", title: "Custom Question", description: "Bring one focused question for a personal reading.", price: 12000 },
];

export default function HomePage() {
  const { t } = useLanguage();
  const [services, setServices] = useState<ReadingType[]>(defaultServices);

  useEffect(() => {
    void api<{ readingTypes: ReadingType[] }>("/api/services")
      .then((catalog) => setServices(catalog.readingTypes))
      .catch(() => undefined);
  }, []);

  return (
    <main className="landing-page">
      <header className="topbar landing-header"><div className="page-width topbar-inner"><Logo /><nav className="topbar-actions"><Link href="/#services">{t.landingServices}</Link><Link href="/about">{t.landingAbout}</Link><Link href="/contact">{t.landingContact}</Link><LanguageToggle /><Link className="button-secondary" href="/login">{t.landingSignIn}</Link></nav></div></header>
      <div className="page-width landing-content">
        <section className="hero">
          <div className="hero-art" role="img" aria-label="Bhone Thaw-Tarot logo surrounded by moving celestial orbits">
            <div className="hero-orbit hero-orbit-celestial" aria-hidden="true">
              <span className="hero-planet hero-planet-moon" />
              <span className="hero-planet hero-planet-sun" />
            </div>
            <Image src="/images/brand/logo.png" alt="Bhone Thaw-Tarot logo" width={460} height={460} priority />
          </div>
          <div className="hero-quick-actions">
            <Link className="button" href="/register">{t.beginReading} <Icon name="arrow" size={17} /></Link>
            <Link className="button-secondary" href="/contact">{t.landingContact}</Link>
          </div>
        </section>
        <LandingDailyMessage />
        <section className="section" id="services"><div className="section-heading"><div><div className="eyebrow">{t.chooseYourFocus}</div><h2>{t.landingSectionTitle}</h2></div><p>{t.landingSectionText}</p></div><div className="service-grid">{services.map((service) => <GlassCard className="service-card" key={service.id}><div className="icon-disc"><Icon name="sparkle" /></div><h3>{localizedReadingTitle(t, service.id, service.title)}</h3><p>{localizedReadingDescription(t, service.id, service.description)}</p><div className="price">{t.fromPrice} <strong>{money(service.price)}</strong></div></GlassCard>)}</div></section>
        <section className="section"><div className="feature-grid"><GlassCard className="feature-card"><div className="icon-disc"><Icon name="calendar" /></div><h3>{t.chooseTimeTitle}</h3><p>{t.chooseTimeText}</p></GlassCard><GlassCard className="feature-card"><div className="icon-disc"><Icon name="moon" /></div><h3>{t.formatsFeatureTitle}</h3><p>{t.formatsFeatureText}</p></GlassCard><GlassCard className="feature-card"><div className="icon-disc"><Icon name="check" /></div><h3>{t.dashboardFeatureTitle}</h3><p>{t.dashboardFeatureText}</p></GlassCard></div></section>
      </div>
      <footer className="page-width" style={{ padding: "1rem 0 3rem", color: "var(--muted)", fontSize: ".78rem" }}><Logo compact /><p style={{ marginTop: ".8rem" }}>© {new Date().getFullYear()} Bhone Thaw-Tarot · <Link href="/privacy">{t.privacy}</Link> · <Link href="/terms">{t.terms}</Link></p></footer>
    </main>
  );
}
