import Link from "next/link";
import { Logo } from "@/components/Logo";
import { GlassCard } from "@/components/GlassCard";

export default function ContactPage() {
  return <main><header className="topbar"><div className="page-width topbar-inner"><Logo /><Link className="button-secondary" href="/">Home</Link></div></header><div className="page-width form-shell" style={{ paddingTop: "9rem" }}><GlassCard><div className="eyebrow">Reach out</div><h1 style={{ marginTop: ".6rem" }}>Questions before booking?</h1><p className="muted" style={{ marginTop: ".75rem" }}>For availability, format questions, or help with a payment, contact Bhone Thaw directly through your preferred channel.</p><div className="list" style={{ marginTop: "1.5rem" }}><div className="list-row"><strong>Telegram</strong><span className="muted">Add your contact in `.env.local`</span></div><div className="list-row"><strong>Phone</strong><span className="muted">Add your contact in `.env.local`</span></div><div className="list-row"><strong>Response time</strong><span className="muted">Usually within one day</span></div></div><Link className="button" style={{ marginTop: "1.5rem" }} href="/register">Start a reading</Link></GlassCard></div></main>;
}
