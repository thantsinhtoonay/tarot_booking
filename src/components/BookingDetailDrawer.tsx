import { dateLabel, money } from "@/lib/client";
import type { BookingStatus, WalletId } from "@/types";
import { Icon } from "@/components/Icon";
import { StatusBadge } from "@/components/StatusBadge";
import { readingTypeLabel, sessionFormatLabel } from "@/lib/site-config";

export type AdminBookingDetail = {
  id: string;
  customer: string;
  customerEmail?: string;
  customerPhone?: string;
  viberNumber?: string;
  telegramId?: string;
  facebookLink?: string;
  fullName?: string;
  readingTypeId: string;
  readingType?: { title: string };
  sessionFormatId: string;
  amount: number;
  status: BookingStatus;
  transactionId?: string;
  receiptUrl?: string;
  wallet?: WalletId;
  adminNote?: string;
  slot?: { date: string; startTime: string; endTime: string };
};

type Props = {
  booking: AdminBookingDetail | null;
  busy?: boolean;
  onClose: () => void;
  onVerify?: (decision: "approved" | "rejected") => void;
};

export function BookingDetailDrawer({ booking, busy = false, onClose, onVerify }: Props) {
  if (!booking) return null;

  const callNumber = booking.customerPhone || booking.viberNumber;
  const telegramHandle = booking.telegramId?.replace(/^@/, "");

  return (
    <>
      <button className="booking-drawer-scrim" type="button" aria-label="Close booking details" onClick={onClose} />
      <aside className="booking-drawer" aria-labelledby="booking-detail-title">
        <div className="booking-drawer-head">
          <div>
            <span className="eyebrow">Booking details</span>
            <h2 id="booking-detail-title">{booking.customer}</h2>
            <p>{booking.id}</p>
          </div>
          <button className="icon-button" type="button" onClick={onClose} aria-label="Close booking details"><Icon name="x" size={18} /></button>
        </div>

        <div className="booking-drawer-status"><StatusBadge status={booking.status} /><span className="muted">{money(booking.amount)}</span></div>

        <div className="booking-detail-grid">
          <div><span>Appointment</span><strong>{booking.slot ? dateLabel(booking.slot.date) : "Not scheduled"}</strong><small>{booking.slot ? `${booking.slot.startTime}–${booking.slot.endTime}` : "—"}</small></div>
          <div><span>Reading</span><strong>{readingTypeLabel(booking.readingTypeId, booking.readingType?.title)}</strong><small>{sessionFormatLabel(booking.sessionFormatId)}</small></div>
          <div><span>Payment method</span><strong>{booking.wallet ?? "Not selected"}</strong><small>{booking.transactionId ?? "No transaction ID"}</small></div>
          <div><span>Customer name</span><strong>{booking.fullName || booking.customer}</strong><small>{booking.adminNote || "No admin note"}</small></div>
        </div>

        <div className="contact-actions">
          {callNumber && <a className="button-secondary compact-button" href={`tel:${callNumber}`}><Icon name="phone" size={14} /> Call</a>}
          {booking.viberNumber && <a className="button-secondary compact-button" href={`viber://chat?number=${encodeURIComponent(booking.viberNumber)}`}><Icon name="phone" size={14} /> Viber</a>}
          {telegramHandle && <a className="button-secondary compact-button" href={`https://t.me/${encodeURIComponent(telegramHandle)}`} target="_blank" rel="noopener noreferrer"><Icon name="telegram" size={14} /> Telegram</a>}
          {booking.facebookLink && <a className="button-secondary compact-button" href={booking.facebookLink} target="_blank" rel="noopener noreferrer"><Icon name="facebook" size={14} /> Facebook</a>}
        </div>

        <section className="booking-receipt-section">
          <div className="drawer-section-heading"><span className="eyebrow">Payment proof</span>{booking.receiptUrl && <a className="text-button" href={booking.receiptUrl} target="_blank" rel="noreferrer">Open image <Icon name="arrow" size={14} /></a>}</div>
          {booking.receiptUrl ? <div className="booking-receipt-image" style={{ backgroundImage: `url('${booking.receiptUrl}')` }} role="img" aria-label="Uploaded payment receipt" /> : <div className="booking-receipt-empty"><Icon name="image" size={20} /> No receipt uploaded</div>}
        </section>

        {booking.status === "pending_payment" && onVerify && <div className="drawer-actions"><button className="button" type="button" disabled={busy} onClick={() => onVerify("approved")}><Icon name="check" size={15} /> {busy ? "Updating…" : "Approve payment"}</button><button className="button-secondary" type="button" disabled={busy} onClick={() => onVerify("rejected")}>Reject</button></div>}
      </aside>
    </>
  );
}
