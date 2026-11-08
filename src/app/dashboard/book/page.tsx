"use client";

import Link from "next/link";
import { ChangeEvent, useEffect, useMemo, useState } from "react";
import { api, dateLabel, money } from "@/lib/client";
import { walletOptions, walletSnapshot } from "@/lib/site-config";
import type { ReadingType, SessionFormat, TimeSlot, WalletId } from "@/types";
import { GlassCard } from "@/components/GlassCard";
import { Spinner } from "@/components/Spinner";
import { Icon } from "@/components/Icon";
import { localizedFormatTitle, localizedReadingDescription, localizedReadingTitle, useLanguage } from "@/components/LanguageProvider";
import { facebookLinkValue, telegramIdValue, viberNumberValue } from "@/lib/validate";

type Catalog = { readingTypes: ReadingType[]; sessionFormats: SessionFormat[] };

export default function BookingPage() {
  const { language, t } = useLanguage();
  const [catalog, setCatalog] = useState<Catalog | null>(null);
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [step, setStep] = useState(1);
  const [readingTypeId, setReadingTypeId] = useState<ReadingType["id"]>("love");
  const [sessionFormatId, setSessionFormatId] = useState<SessionFormat["id"]>("written");
  const [date, setDate] = useState("");
  const [slotId, setSlotId] = useState("");
  const [form, setForm] = useState({ fullName: "", dob: "", tob: "", questions: "", viberNumber: "", telegramId: "", facebookLink: "", wallet: "kpay" as WalletId, transactionId: "" });
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState("");
  const [copyState, setCopyState] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [contactErrors, setContactErrors] = useState({ viberNumber: "", telegramId: "", facebookLink: "" });
  const [showContactAlert, setShowContactAlert] = useState(false);
  const [complete, setComplete] = useState(false);

  useEffect(() => {
    void Promise.all([api<Catalog>("/api/services"), api<TimeSlot[]>("/api/slots")])
      .then(([items, available]) => {
        setCatalog(items);
        setReadingTypeId((current) => items.readingTypes.some((item) => item.id === current) ? current : items.readingTypes[0]?.id ?? "");
        setSlots(available);
        setDate(available[0]?.date ?? "");
      })
      .catch((err) => setError(err instanceof Error ? err.message : t.unableLoadBooking))
      .finally(() => setLoading(false));
  }, [t]);

  useEffect(() => () => {
    if (receiptPreview) URL.revokeObjectURL(receiptPreview);
  }, [receiptPreview]);

  const dates = useMemo(() => Array.from(new Set(slots.map((slot) => slot.date))), [slots]);
  const dateSlots = useMemo(() => slots.filter((slot) => slot.date === date), [date, slots]);
  const reading = catalog?.readingTypes.find((item) => item.id === readingTypeId);
  const format = catalog?.sessionFormats.find((item) => item.id === sessionFormatId);
  const selectedWallet = walletOptions.find((item) => item.id === form.wallet);
  const amount = (reading?.price ?? 0) + (format?.priceDelta ?? 0);
  const update = (key: keyof typeof form, value: string) => setForm((current) => ({ ...current, [key]: value }));

  const chooseReceipt = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setError("");
    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) return setError(t.receiptHelp);
    if (file.size > 5 * 1024 * 1024) return setError(t.receiptHelp);
    setReceiptFile(file);
    setReceiptPreview(URL.createObjectURL(file));
  };

  const copyMerchantNumber = async () => {
    if (!selectedWallet?.accountNumber) return;
    try {
      await navigator.clipboard.writeText(selectedWallet.accountNumber);
      setCopyState(t.copied);
      window.setTimeout(() => setCopyState(""), 1600);
    } catch {
      setCopyState(t.copyUnavailable);
    }
  };

  const next = () => {
    setError("");
    if (step === 1 && !readingTypeId) return setError(t.chooseReadingFocusError);
    if (step === 2 && !slotId) return setError(t.chooseAvailableTimeError);
    if (step === 3 && (!form.fullName || !form.dob || !form.tob)) return setError(t.completeBirthDetailsError);
    if (step === 4 && !validateContact()) return;
    setStep((value) => Math.min(5, value + 1));
  };

  const validateContact = () => {
    const nextErrors = { viberNumber: "", telegramId: "", facebookLink: "" };
    let viberNumber = "";
    let telegramId: string | undefined;
    let facebookLink: string | undefined;
    try { viberNumber = viberNumberValue(form.viberNumber); } catch { nextErrors.viberNumber = t.viberNumberRequired; }
    try { telegramId = telegramIdValue(form.telegramId); } catch { nextErrors.telegramId = t.fixContactFields; }
    try { facebookLink = facebookLinkValue(form.facebookLink); } catch { nextErrors.facebookLink = t.fixContactFields; }
    setContactErrors(nextErrors);
    setForm((current) => ({ ...current, viberNumber: viberNumber || current.viberNumber, telegramId: telegramId ?? current.telegramId, facebookLink: facebookLink ?? current.facebookLink }));
    if (nextErrors.viberNumber) {
      setShowContactAlert(true);
      return false;
    }
    if (nextErrors.telegramId || nextErrors.facebookLink) {
      setError(t.fixContactFields);
      return false;
    }
    return true;
  };

  const submit = async () => {
    if (!slotId || !catalog) return;
    if (!form.transactionId.trim() || !receiptFile) return setError(t.completePaymentError);
    setBusy(true);
    setError("");
    try {
      const booking = await api<{ id: string }>("/api/bookings", {
        method: "POST",
        body: JSON.stringify({ readingTypeId, sessionFormatId, slotId, fullName: form.fullName, dob: form.dob, tob: form.tob, questions: form.questions, viberNumber: form.viberNumber, telegramId: form.telegramId, facebookLink: form.facebookLink, wallet: form.wallet, merchantAccountSnapshot: walletSnapshot(form.wallet) }),
      });
      const upload = new FormData();
      upload.append("file", receiptFile);
      const result = await api<{ url: string }>("/api/upload", { method: "POST", body: upload });
      await api(`/api/bookings/${booking.id}/payment`, { method: "POST", body: JSON.stringify({ wallet: form.wallet, transactionId: form.transactionId.trim(), receiptUrl: result.url }) });
      setComplete(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.unableCreateBooking);
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <Spinner label={t.preparingBooking} />;
  if (complete) {
    return (
      <div className="form-shell">
        <GlassCard className="empty-state">
          <div className="icon-disc" style={{ margin: "0 auto 1rem" }}><Icon name="check" /></div>
          <h2>{t.reserved}</h2>
          <p>{t.paymentWaiting}</p>
          <Link className="button" style={{ marginTop: "1.4rem" }} href="/dashboard/profile">{t.viewBookingStatus}</Link>
        </GlassCard>
      </div>
    );
  }

  return (
    <div>
      <div className="page-title">
        <div>
          <div className="eyebrow">{t.guidedBooking}</div>
          <h1>{t.bookYourReading}</h1>
          <p>{t.bookingIntro}</p>
        </div>
      </div>
      {error && <div className="inline-error" role="alert">{error}</div>}
      <div className="wizard">
        <div>
          <div className="stepper" aria-label={t.bookingProgress}>
            {[t.focus, t.time, t.details, t.contact, t.payment].map((label, index) => (
              <span className={`step ${step >= index + 1 ? "active" : ""}`} key={label}><b>{index + 1}</b>{label}</span>
            ))}
          </div>
          <GlassCard>
            {step === 1 && (
              <>
                <div className="eyebrow">{t.stepOne}</div>
                <h2 style={{ marginTop: ".5rem" }}>{t.clarityPrompt}</h2>
                <div className="choice-grid">
                  {catalog?.readingTypes.map((item) => (
                    <button type="button" className={`choice ${readingTypeId === item.id ? "selected" : ""}`} key={item.id} onClick={() => setReadingTypeId(item.id)} aria-pressed={readingTypeId === item.id}>
                      <strong>{localizedReadingTitle(t, item.id, item.title)}</strong><small>{localizedReadingDescription(t, item.id, item.description)}</small><small>{money(item.price)}</small>
                    </button>
                  ))}
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <div className="eyebrow">{t.stepTwo}</div>
                <h2 style={{ marginTop: ".5rem" }}>{t.chooseFormatTime}</h2>
                <div className="choice-grid">
                  {catalog?.sessionFormats.map((item) => (
                    <button type="button" className={`choice ${sessionFormatId === item.id ? "selected" : ""}`} key={item.id} onClick={() => setSessionFormatId(item.id)} aria-pressed={sessionFormatId === item.id}>
                      <strong>{localizedFormatTitle(t, item.id, item.title)}</strong><small>{item.durationMin} {t.minutes} · {item.priceDelta ? `+${money(item.priceDelta)}` : t.included}</small>
                    </button>
                  ))}
                </div>
                <div className="booking-schedule-section">
                  <label className="eyebrow">{t.date}</label>
                  <div className="date-strip">
                    {dates.map((item) => (
                      <button type="button" className={`date-pill ${date === item ? "selected" : ""}`} key={item} onClick={() => { setDate(item); setSlotId(""); }} aria-label={`${t.date}: ${dateLabel(item, language === "my" ? "my-MM" : "en-US")}`} aria-pressed={date === item}>{dateLabel(item, language === "my" ? "my-MM" : "en-US")}</button>
                    ))}
                  </div>
                  <label className="eyebrow schedule-time-label">{t.availableTimes}</label>
                  <div className="slot-grid">
                    {dateSlots.length ? dateSlots.map((item) => (
                      <button type="button" className={`slot ${slotId === item.id ? "selected" : ""}`} key={item.id} onClick={() => setSlotId(item.id)} aria-pressed={slotId === item.id}>
                        <Icon name="clock" size={14} />{item.startTime}–{item.endTime}
                      </button>
                    )) : <p className="muted" style={{ marginTop: ".75rem", fontSize: ".78rem" }}>{t.noTimes}</p>}
                  </div>
                </div>
              </>
            )}

            {step === 3 && (
              <>
                <div className="eyebrow">{t.stepThree}</div>
                <h2 style={{ marginTop: ".5rem" }}>{t.tellCards}</h2>
                <div className="form">
                  <div className="field"><label htmlFor="fullName">{t.fullName}</label><input id="fullName" value={form.fullName} onChange={(event) => update("fullName", event.target.value)} required /></div>
                  <div className="choice-grid">
                    <div className="field"><label htmlFor="dob">{t.dateOfBirth}</label><input className="date-time-input" id="dob" type="date" value={form.dob} onChange={(event) => update("dob", event.target.value)} required /></div>
                    <div className="field"><label htmlFor="tob">{t.timeOfBirth}</label><input className="date-time-input" id="tob" type="time" value={form.tob} onChange={(event) => update("tob", event.target.value)} required /></div>
                  </div>
                  <div className="field"><label htmlFor="questions">{t.yourQuestion}</label><textarea id="questions" value={form.questions} onChange={(event) => update("questions", event.target.value)} placeholder={t.questionPlaceholder} /></div>
                </div>
              </>
            )}

            {step === 4 && (
              <>
                <div className="eyebrow">{t.contactStep}</div>
                <h2 style={{ marginTop: ".5rem" }}>{t.contactStepTitle}</h2>
                <p className="muted booking-contact-intro">{t.contactStepText}</p>
                <div className="form">
                  <div className={`field ${contactErrors.viberNumber ? "field-invalid" : ""}`}>
                    <label htmlFor="viberNumber">{t.viberNumber}</label>
                    <input id="viberNumber" value={form.viberNumber} onChange={(event) => { update("viberNumber", event.target.value); setContactErrors((current) => ({ ...current, viberNumber: "" })); }} placeholder="+959 755 266 755" autoComplete="tel" aria-invalid={Boolean(contactErrors.viberNumber)} aria-describedby="viberNumber-help viberNumber-error" required />
                    <small id="viberNumber-help" className="muted">{t.viberNumberHelp}</small>
                    {contactErrors.viberNumber && <small id="viberNumber-error" className="field-error" role="alert">{contactErrors.viberNumber}</small>}
                  </div>
                  <div className={`field ${contactErrors.telegramId ? "field-invalid" : ""}`}>
                    <label htmlFor="telegramId">{t.telegramUsername} <span className="muted">({t.optional})</span></label>
                    <input id="telegramId" value={form.telegramId} onChange={(event) => { update("telegramId", event.target.value); setContactErrors((current) => ({ ...current, telegramId: "" })); }} placeholder="@username" autoComplete="off" aria-invalid={Boolean(contactErrors.telegramId)} aria-describedby="telegramId-help telegramId-error" />
                    <small id="telegramId-help" className="muted">{t.telegramHelp}</small>
                    {contactErrors.telegramId && <small id="telegramId-error" className="field-error" role="alert">{contactErrors.telegramId}</small>}
                  </div>
                  <div className={`field ${contactErrors.facebookLink ? "field-invalid" : ""}`}>
                    <label htmlFor="facebookLink">{t.facebookLink} <span className="muted">({t.optional})</span></label>
                    <input id="facebookLink" type="url" value={form.facebookLink} onChange={(event) => { update("facebookLink", event.target.value); setContactErrors((current) => ({ ...current, facebookLink: "" })); }} placeholder="https://www.facebook.com/..." autoComplete="url" aria-invalid={Boolean(contactErrors.facebookLink)} aria-describedby="facebookLink-help facebookLink-error" />
                    <small id="facebookLink-help" className="muted">{t.facebookHelp}</small>
                    {contactErrors.facebookLink && <small id="facebookLink-error" className="field-error" role="alert">{contactErrors.facebookLink}</small>}
                  </div>
                </div>
              </>
            )}

            {step === 5 && (
              <>
                <div className="eyebrow">{t.stepFour}</div>
                <h2 style={{ marginTop: ".5rem" }}>{t.confirmPayment}</h2>
                <details className="payment-guide" open>
                  <summary>
                    <span className="payment-guide-summary-icon"><Icon name="alert" size={20} /></span>
                    <span className="payment-guide-summary-copy"><strong>{t.paymentGuideTitle}</strong><small>{t.paymentGuideSummary}</small></span>
                    <Icon name="chevron" size={18} />
                  </summary>
                  <div className="payment-guide-body">
                    <div className="payment-guide-notice"><Icon name="alert" size={18} /><p>{t.paymentGuideNotice}</p></div>
                    <ol className="payment-guide-steps">
                      <li><span className="payment-guide-step-number">1</span><div><strong>{t.paymentGuideStepOneTitle}</strong><p>{t.paymentGuideStepOneText}</p></div></li>
                      <li><span className="payment-guide-step-number">2</span><div><strong>{t.paymentGuideStepTwoTitle}</strong><p>{t.paymentGuideStepTwoText}</p></div></li>
                      <li><span className="payment-guide-step-number">3</span><div><strong>{t.paymentGuideStepThreeTitle}</strong><p>{t.paymentGuideStepThreeText}</p></div></li>
                    </ol>
                    <div className="payment-guide-amount"><span>{t.paymentGuideAmountLabel}</span><strong>{money(amount)}</strong></div>
                    <p className="payment-guide-upload-note"><Icon name="image" size={16} /> {t.paymentGuideUploadNote}</p>
                  </div>
                </details>
                <div className="payment-layout">
                  <div className="payment-fields">
                    <div className="wallet-grid">
                      {walletOptions.map((wallet) => (
                        <button type="button" key={wallet.id} className={`wallet-choice ${form.wallet === wallet.id ? "selected" : ""}`} onClick={() => update("wallet", wallet.id)} aria-pressed={form.wallet === wallet.id}>
                          <strong>{wallet.label}</strong><small>{wallet.accountNumber || t.accountDetailsPending}</small>
                        </button>
                      ))}
                    </div>
                    <div className="merchant-card">
                      <div><span className="muted">{t.payTo}</span><strong>{selectedWallet?.accountName}</strong><small>{selectedWallet?.accountNumber || t.merchantAccountPending}</small></div>
                      <button type="button" className="ghost-button" onClick={() => void copyMerchantNumber()} disabled={!selectedWallet?.accountNumber}><Icon name="check" size={15} /> {copyState || t.copyNumber}</button>
                    </div>
                    <div className="field"><label htmlFor="transactionId">{t.transactionId}</label><input id="transactionId" value={form.transactionId} onChange={(event) => update("transactionId", event.target.value)} placeholder={t.transactionPlaceholder} required /></div>
                    <div className="field">
                      <label htmlFor="receiptFile">{t.paymentReceipt}</label>
                      <input id="receiptFile" type="file" accept="image/png,image/jpeg,image/webp" onChange={chooseReceipt} required />
                      <small className="muted">{t.receiptHelp}</small>
                      {receiptPreview && <div className="receipt-preview" style={{ backgroundImage: `url('${receiptPreview}')` }} role="img" aria-label={t.paymentReceiptPreview} />}
                    </div>
                    <div className="payment-total"><span>{t.totalAmount}</span><strong>{money(amount)}</strong></div>
                  </div>
                </div>
              </>
            )}
          </GlassCard>
          <div className="wizard-actions">
            <button className="button-secondary" type="button" onClick={() => setStep((value) => Math.max(1, value - 1))} disabled={step === 1}>{t.back}</button>
            {step < 5 ? <button className="button" type="button" onClick={next}>{t.continue} <Icon name="arrow" size={16} /></button> : <button className="button" type="button" onClick={() => void submit()} disabled={busy}>{busy ? t.submitting : t.reserveReading}</button>}
          </div>
        </div>
        <GlassCard className="summary-card">
          <div className="eyebrow">{t.yourSummary}</div>
          <h3 style={{ marginTop: ".4rem" }}>{reading ? localizedReadingTitle(t, reading.id, reading.title) : t.chooseFocus}</h3>
          <div className="summary-line"><span>{t.format}</span><strong>{format ? localizedFormatTitle(t, format.id, format.title) : "—"}</strong></div>
          <div className="summary-line"><span>{t.time}</span><strong>{slots.find((slot) => slot.id === slotId)?.startTime ?? "—"}</strong></div>
          <div className="summary-total"><span>{t.totalAmount}</span><strong>{money(amount)}</strong></div>
        </GlassCard>
      </div>
      {showContactAlert && <div className="modal-scrim" role="presentation"><section className="alert-dialog" role="alertdialog" aria-modal="true" aria-labelledby="contact-alert-title" aria-describedby="contact-alert-text"><div className="icon-disc"><Icon name="phone" size={20} /></div><h2 id="contact-alert-title">{t.contactAlertTitle}</h2><p id="contact-alert-text">{t.contactAlertText}</p><button className="button" type="button" onClick={() => { setShowContactAlert(false); document.getElementById("viberNumber")?.focus(); }}>{t.contactAlertAction}</button></section></div>}
    </div>
  );
}
