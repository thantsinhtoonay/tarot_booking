import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Bhone Thaw-Tarot", template: "%s — Bhone Thaw-Tarot" },
  description: "Thoughtful tarot readings for love, career, and your next chapter.",
  icons: { icon: "/images/brand/logo.png" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
