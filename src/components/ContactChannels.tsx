"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/Icon";
import { useLanguage } from "@/components/LanguageProvider";

const TELEGRAM_HANDLE = "@Eimfll2947";
const PHONE_NUMBER = "+959755266755";

type CopyTarget = "telegram" | "phone";

export function ContactChannels() {
  const { t } = useLanguage();
  const [copiedTarget, setCopiedTarget] = useState<CopyTarget | null>(null);
  const [copyError, setCopyError] = useState<CopyTarget | null>(null);

  useEffect(() => {
    if (!copiedTarget && !copyError) return;
    const timeout = window.setTimeout(() => {
      setCopiedTarget(null);
      setCopyError(null);
    }, 2200);
    return () => window.clearTimeout(timeout);
  }, [copiedTarget, copyError]);

  async function copyContact(target: CopyTarget, value: string) {
    try {
      if (!navigator.clipboard) throw new Error("Clipboard unavailable");
      await navigator.clipboard.writeText(value);
      setCopyError(null);
      setCopiedTarget(target);
    } catch {
      setCopiedTarget(null);
      setCopyError(target);
    }
  }

  return (
    <section className="contact-channels" aria-labelledby="contact-channels-title">
      <div className="contact-section-heading">
        <div>
          <div className="eyebrow">{t.contactEyebrow}</div>
          <h2 id="contact-channels-title">{t.contactChannelsTitle}</h2>
        </div>
        <p className="contact-response">{t.contactResponseTime}</p>
      </div>

      <div className="contact-channel-grid">
        <a className="contact-channel contact-channel-facebook" href="https://www.facebook.com/share/19EHapWMgU/" target="_blank" rel="noopener noreferrer">
          <span className="contact-channel-icon" aria-hidden="true"><Icon name="facebook" size={24} /></span>
          <span className="contact-channel-copy"><strong>{t.facebookTitle}</strong><small>{t.facebookSubtitle}</small></span>
          <span className="contact-channel-arrow" aria-hidden="true"><Icon name="arrow" size={18} /></span>
        </a>

        <div className="contact-channel contact-channel-telegram">
          <span className="contact-channel-icon" aria-hidden="true"><Icon name="telegram" size={24} /></span>
          <span className="contact-channel-copy"><strong>{t.telegramTitle}</strong><small>{TELEGRAM_HANDLE} · {t.telegramSubtitle}</small></span>
          <div className="contact-channel-actions">
            <a className="contact-action-button contact-action-primary" href="https://t.me/Eimfll2947" target="_blank" rel="noopener noreferrer">{t.openTelegram}<Icon name="arrow" size={15} /></a>
            <button className={`contact-copy-button${copiedTarget === "telegram" ? " is-copied" : ""}`} type="button" onClick={() => void copyContact("telegram", TELEGRAM_HANDLE)} aria-label={copiedTarget === "telegram" ? t.copied : `${t.copyHandle} ${TELEGRAM_HANDLE}`} title={copiedTarget === "telegram" ? t.copied : t.copyHandle}>
              <Icon name={copiedTarget === "telegram" ? "check" : "copy"} size={15} />
              <span>{copiedTarget === "telegram" ? t.copied : copyError === "telegram" ? t.copyUnavailable : t.copyHandle}</span>
            </button>
          </div>
        </div>

        <div className="contact-channel contact-channel-viber">
          <span className="contact-channel-icon" aria-hidden="true"><Icon name="phone" size={24} /></span>
          <span className="contact-channel-copy"><strong>{t.viberTitle}</strong><small>{PHONE_NUMBER} · {t.viberSubtitle}</small></span>
          <div className="contact-channel-actions">
            <a className="contact-action-button contact-action-viber" href="viber://chat?number=%2B959755266755">{t.openViber}<Icon name="arrow" size={15} /></a>
            <a className="contact-action-button contact-action-call" href={`tel:${PHONE_NUMBER}`}><Icon name="phone" size={15} />{t.callNow}</a>
            <button className={`contact-copy-button${copiedTarget === "phone" ? " is-copied" : ""}`} type="button" onClick={() => void copyContact("phone", PHONE_NUMBER)} aria-label={copiedTarget === "phone" ? t.copied : `${t.copyPhone} ${PHONE_NUMBER}`} title={copiedTarget === "phone" ? t.copied : t.copyPhone}>
              <Icon name={copiedTarget === "phone" ? "check" : "copy"} size={15} />
              <span>{copiedTarget === "phone" ? t.copied : copyError === "phone" ? t.copyUnavailable : t.copyPhone}</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
