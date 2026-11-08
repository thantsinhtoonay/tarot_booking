"use client";

import Link from "next/link";
import { ContactChannels } from "@/components/ContactChannels";
import { GlassCard } from "@/components/GlassCard";
import { LanguageToggle, useLanguage } from "@/components/LanguageProvider";
import { Logo } from "@/components/Logo";

export default function ContactPage() {
  const { t } = useLanguage();
  return (
    <main>
      <header className="topbar"><div className="page-width topbar-inner"><Logo /><nav className="topbar-actions"><LanguageToggle /><Link className="button-secondary" href="/">{t.home}</Link></nav></div></header>
      <div className="page-width contact-page">
        <GlassCard className="contact-intro-card">
          <div className="eyebrow">{t.contactEyebrow}</div>
          <h1>{t.contactTitle}</h1>
          <p className="muted">{t.contactIntro}</p>
          <ContactChannels />
          <Link className="button contact-book-button" href="/register">{t.beginReading}</Link>
        </GlassCard>
      </div>
    </main>
  );
}
