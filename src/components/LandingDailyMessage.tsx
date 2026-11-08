"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api, dateLabel } from "@/lib/client";
import type { DailyTarotMessage } from "@/types";
import { GlassCard } from "@/components/GlassCard";
import { Icon } from "@/components/Icon";
import { useLanguage } from "@/components/LanguageProvider";

function todayInMyanmar() {
  const parts = new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Rangoon", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(new Date());
  const values = Object.fromEntries(parts.filter((part) => part.type !== "literal").map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

export function LandingDailyMessage() {
  const { language, t } = useLanguage();
  const [message, setMessage] = useState<DailyTarotMessage | null>(null);
  const [loading, setLoading] = useState(true);
  const date = todayInMyanmar();

  useEffect(() => {
    void api<DailyTarotMessage | null>(`/api/daily-message?date=${date}`)
      .then(setMessage)
      .catch(() => setMessage(null))
      .finally(() => setLoading(false));
  }, [date]);

  const artStyle = message?.cardImage
    ? { backgroundImage: `radial-gradient(circle at 50% 35%, rgba(229,193,88,.18), transparent 32%), linear-gradient(180deg, transparent 10%, rgba(11,13,27,.92) 88%), url('${message.cardImage}')` }
    : undefined;
  const formattedDate = dateLabel(date, language === "my" ? "my-MM" : "en-US");

  return (
    <section className="section landing-daily-section" aria-labelledby="daily-message-title">
      <div className="section-heading"><div><div className="eyebrow">{t.dailySectionEyebrow}</div><h2 id="daily-message-title">{t.dailySectionTitle}</h2></div><p>{t.dailySectionText}</p></div>
      <GlassCard className="landing-daily-card">
        <div className="landing-daily-art" style={artStyle}><Icon name="sparkle" size={30} /></div>
        <div className="landing-daily-copy">
          <div className="eyebrow">{t.publishedFor} · {formattedDate}</div>
          <h3>{loading ? t.preparingDashboard : message?.cardName ?? t.messageWaiting}</h3>
          <p>{message?.adviceText ?? t.dailyNotPublished}</p>
          {message?.keywords?.length ? <div className="keyword-row">{message.keywords.slice(0, 4).map((keyword) => <span key={keyword}>{keyword}</span>)}</div> : null}
          <Link className="button-secondary" href="/register">{message ? t.viewDailyReading : t.viewReadings} <Icon name="arrow" size={16} /></Link>
        </div>
      </GlassCard>
    </section>
  );
}
