"use client";

import { AboutContent } from "@/components/AboutContent";
import { useLanguage } from "@/components/LanguageProvider";

export default function DashboardAboutPage() {
  const { t } = useLanguage();
  return <div><div className="page-title"><div><div className="eyebrow">{t.storyBehindCards}</div><h1>{t.aboutTitle}</h1><p>{t.aboutIntro}</p></div></div><AboutContent authenticated /></div>;
}
