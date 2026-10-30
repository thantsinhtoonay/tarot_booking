import Link from "next/link";
import Image from "next/image";
import { GlassCard } from "@/components/GlassCard";
import { Icon } from "@/components/Icon";
import { Logo } from "@/components/Logo";

const services = [
  ["Love reading", "Clarity for relationships and matters of the heart.", "15,000 MMK"],
  ["Career reading", "Guidance for work, direction, and opportunity.", "15,000 MMK"],
  ["Overall life", "A wider view of your current path and energy.", "18,000 MMK"],
  ["Custom question", "Bring one focused question for a personal reading.", "12,000 MMK"],
];

export default function HomePage() {
  return (
    <main className="landing-page">
      <header className="topbar landing-header"><div className="page-width topbar-inner"><Logo /><nav className="topbar-actions"><Link href="/#services">Services</Link><Link href="/about">About</Link><Link href="/contact">Contact</Link><Link className="button-secondary" href="/login">Sign in</Link></nav></div></header>
      <div className="page-width landing-content">
        <section className="hero">
          <div>
            <div className="eyebrow">A quiet reading for your next chapter</div>
            <h1><span>Let the cards</span><span>illuminate</span><em>what comes next.</em></h1>
            <p>Personal tarot readings by Bhone Thaw — grounded, thoughtful, and made for the questions you are carrying today.</p>
            <div className="hero-actions"><Link className="button" href="/register">Begin your reading <Icon name="arrow" size={17} /></Link><Link className="button-secondary" href="/about">Meet Bhone Thaw</Link></div>
            <div className="hero-proof"><span><Icon name="check" size={15} /> Personal guidance</span><span><Icon name="check" size={15} /> Flexible formats</span><span><Icon name="check" size={15} /> Private booking</span></div>
          </div>
          <div className="hero-art"><Image src="/images/brand/logo.png" alt="Bhone Thaw-Tarot logo" width={420} height={420} priority /><div className="hero-badge"><strong>Read with intention</strong><span>Love · career · life · custom questions</span></div></div>
        </section>
        <section className="section" id="services"><div className="section-heading"><div><div className="eyebrow">Choose your focus</div><h2>Readings for the moment you are in.</h2></div><p>Start with a question, a feeling, or simply the need for a little clarity.</p></div><div className="service-grid">{services.map(([title, description, price]) => <GlassCard className="service-card" key={title}><div className="icon-disc"><Icon name="sparkle" /></div><h3>{title}</h3><p>{description}</p><div className="price">from <strong>{price}</strong></div></GlassCard>)}</div></section>
        <section className="section"><div className="feature-grid"><GlassCard className="feature-card"><div className="icon-disc"><Icon name="calendar" /></div><h3>Choose a time that feels right</h3><p>Browse available slots and reserve your reading in a few calm steps.</p></GlassCard><GlassCard className="feature-card"><div className="icon-disc"><Icon name="moon" /></div><h3>Written, voice, or video</h3><p>Pick the format that lets you receive the message most naturally.</p></GlassCard><GlassCard className="feature-card"><div className="icon-disc"><Icon name="check" /></div><h3>One place for your readings</h3><p>Follow your bookings, payment status, and daily message from your dashboard.</p></GlassCard></div></section>
      </div>
      <footer className="page-width" style={{ padding: "1rem 0 3rem", color: "var(--muted)", fontSize: ".78rem" }}><Logo compact /><p style={{ marginTop: ".8rem" }}>© {new Date().getFullYear()} Bhone Thaw-Tarot · <Link href="/privacy">Privacy</Link> · <Link href="/terms">Terms</Link></p></footer>
    </main>
  );
}
