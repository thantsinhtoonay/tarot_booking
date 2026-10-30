import Link from "next/link";
import { Logo } from "@/components/Logo";
import { AboutContent } from "@/components/AboutContent";

export default function AboutPage() {
  return <main><header className="topbar"><div className="page-width topbar-inner"><Logo /><Link className="button-secondary" href="/">Home</Link></div></header><div className="page-width about-page" style={{ paddingTop: "8rem" }}><div className="page-title"><div><div className="eyebrow">A little about the practice</div><h1>Meet the person behind the cards.</h1><p>Start with the astrologer, then discover the care that shapes the reading space around you.</p></div></div><AboutContent /></div></main>;
}
