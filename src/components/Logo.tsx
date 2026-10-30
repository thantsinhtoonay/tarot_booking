import Image from "next/image";
import Link from "next/link";

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className="brand-lockup">
      <span className="brand-mark"><Image src="/images/brand/logo.png" alt="Bhone Thaw-Tarot" width={48} height={48} priority /></span>
      {!compact && <span className="brand-copy"><strong>Bhone Thaw</strong><small>Tarot readings</small></span>}
    </Link>
  );
}
