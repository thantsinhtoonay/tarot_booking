"use client";

import Image from "next/image";
import Link from "next/link";
import { GlassCard } from "@/components/GlassCard";
import { Icon } from "@/components/Icon";
import { useLanguage } from "@/components/LanguageProvider";

export function AboutContent({ authenticated = false }: { authenticated?: boolean }) {
  const { t } = useLanguage();
  return (
    <div className="about-story">
      <GlassCard className="astrologer-feature">
        <div className="about-copy astrologer-copy">
          <div className="eyebrow">{t.astrologerBehindReadings}</div>
          <h2>Bhone Thaw</h2>
          <p className="about-lead">{t.aboutLead}</p>
          <p>{t.tarotMirrorText}</p>
          <p>{t.readingAimText}</p>
          <Link className="button" href={authenticated ? "/dashboard/book" : "/register"}>{t.bookReading} <Icon name="arrow" size={16} /></Link>
        </div>
        <div className="astrologer-portrait">
          <Image src="/images/astrologer/bhone-thaw.png" alt={t.astrologerAlt} width={800} height={1000} priority />
        </div>
      </GlassCard>
      <GlassCard className="developer-feature">
        <div className="about-copy developer-copy"><div className="eyebrow">{t.noteFromMaker}</div><h2>{t.designedWithCare}</h2><p>{t.aboutText}</p><p className="developer-credit">{t.developerCredit}</p></div>
        <div className="developer-portrait"><Image src="/images/developer/developer.png" alt={t.developerAlt} width={500} height={500} /></div>
      </GlassCard>
    </div>
  );
}
