"use client";

import { usePathname } from "next/navigation";
import { AppShell } from "@/components/AppShell";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname === "/admin/login") return children;
  return <AppShell portal="admin">{children}</AppShell>;
}
