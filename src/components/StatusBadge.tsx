import type { BookingStatus } from "@/types";

export function StatusBadge({ status }: { status: BookingStatus }) {
  const label = status.replaceAll("_", " ");
  return <span className={`status-badge status-${status}`}>{label}</span>;
}
