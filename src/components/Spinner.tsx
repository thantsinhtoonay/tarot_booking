import Image from "next/image";

export function Spinner({ label = "Loading your reading…" }: { label?: string }) {
  return (
    <div className="floating-loader" role="status" aria-live="polite">
      <div className="loader-orbit"><Image src="/images/brand/logo.png" alt="" width={48} height={48} /></div>
      <p>{label}</p>
    </div>
  );
}
