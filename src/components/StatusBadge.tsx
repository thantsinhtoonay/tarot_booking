"use client";

import type { BookingStatus } from "@/types";
import { useLanguage } from "@/components/LanguageProvider";
import { usePathname } from "next/navigation";

export function StatusBadge({ status }: { status: BookingStatus }) {
  const { t } = useLanguage();
  const pathname = usePathname();
  const labels: Record<BookingStatus, string> = { pending_payment: t.pendingPayment, confirmed: t.confirmed, completed: t.completed, rejected: t.rejected };
  const englishLabels: Record<BookingStatus, string> = { pending_payment: "Pending payment", confirmed: "Confirmed", completed: "Completed", rejected: "Rejected" };
  const label = pathname.startsWith("/admin") ? englishLabels[status] : labels[status];
  return <span className={`status-badge status-${status}`}>{label}</span>;
}
