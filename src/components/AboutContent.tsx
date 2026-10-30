import Image from "next/image";
import Link from "next/link";
import { GlassCard } from "@/components/GlassCard";
import { Icon } from "@/components/Icon";

export function AboutContent({ authenticated = false }: { authenticated?: boolean }) {
  return (
    <div className="about-story">
      <GlassCard className="astrologer-feature">
        <div className="about-copy astrologer-copy">
          <div className="eyebrow">The astrologer behind the readings</div>
          <h2>Bhone Thaw</h2>
          <p className="about-lead">A thoughtful guide for the questions you are ready to bring into the light.</p>
          <p>Tarot is a mirror, a pause, and a way to listen more closely to your own intuition. Each reading is held with care, honesty, and space for your story to unfold without pressure.</p>
          <p>Whether your focus is love, career, or a question that does not fit neatly into a category, the aim is the same: to help you leave with a clearer sense of your next step.</p>
          <Link className="button" href={authenticated ? "/dashboard/book" : "/register"}>Book a reading <Icon name="arrow" size={16} /></Link>
        </div>
        <div className="astrologer-portrait">
          <Image src="/images/astrologer/bhone-thaw.png" alt="Bhone Thaw, astrologer and tarot reader" width={800} height={1000} priority />
        </div>
      </GlassCard>
      <GlassCard className="developer-feature">
        <div className="about-copy developer-copy"><div className="eyebrow">A note from the maker</div><h2>Designed with care.</h2><p>This reading space was built to feel calm and clear, from the first question to the moment your message arrives.</p><p className="developer-credit">The developer section is intentionally kept below the astrologer’s story — the reading remains the heart of the experience.</p></div>
        <div className="developer-portrait"><Image src="/images/developer/developer.png" alt="The developer who created this reading space" width={500} height={500} /></div>
      </GlassCard>
    </div>
  );
}
