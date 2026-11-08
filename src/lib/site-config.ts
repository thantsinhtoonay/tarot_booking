import type { ReadingTypeId, SessionFormatId, WalletId } from "@/types";

export type WalletOption = {
  id: WalletId;
  label: string;
  accountName: string;
  accountNumber: string;
};

export const walletOptions: WalletOption[] = [
  { id: "kpay", label: "KPay", accountName: process.env.NEXT_PUBLIC_KPAY_ACCOUNT_NAME || "Bhone Thaw-Tarot", accountNumber: process.env.NEXT_PUBLIC_KPAY_ACCOUNT_NUMBER || "" },
  { id: "wavepay", label: "WavePay", accountName: process.env.NEXT_PUBLIC_WAVEPAY_ACCOUNT_NAME || "Bhone Thaw-Tarot", accountNumber: process.env.NEXT_PUBLIC_WAVEPAY_ACCOUNT_NUMBER || "" },
  { id: "aya", label: "AYA Pay", accountName: process.env.NEXT_PUBLIC_AYA_ACCOUNT_NAME || "Bhone Thaw-Tarot", accountNumber: process.env.NEXT_PUBLIC_AYA_ACCOUNT_NUMBER || "" },
  { id: "cbpay", label: "CB Pay", accountName: process.env.NEXT_PUBLIC_CBPAY_ACCOUNT_NAME || "Bhone Thaw-Tarot", accountNumber: process.env.NEXT_PUBLIC_CBPAY_ACCOUNT_NUMBER || "" },
];

export const readingTypeLabels: Record<ReadingTypeId, string> = {
  love: "Love reading",
  career: "Career reading",
  overall: "Overall life reading",
  custom: "Custom question",
};

export const sessionFormatLabels: Record<SessionFormatId, string> = {
  written: "Written report",
  voice: "Voice reading",
  video: "Video reading",
};

export function readingTypeLabel(value: string, fallback?: string) {
  return fallback ?? readingTypeLabels[value as ReadingTypeId] ?? value.replaceAll("_", " ");
}

export function sessionFormatLabel(value: string) {
  return sessionFormatLabels[value as SessionFormatId] ?? value.replaceAll("_", " ");
}

export function walletSnapshot(wallet: WalletId) {
  const option = walletOptions.find((item) => item.id === wallet);
  return option ? JSON.stringify(option) : undefined;
}
