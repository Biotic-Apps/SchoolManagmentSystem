import { LandingContainer } from "./LandingContainer";
import { HeroBackground } from "./hero/HeroBackground";
import { HeroCopy } from "./hero/HeroCopy";
import { HeroVisual } from "./hero/HeroVisual";

/** Top of the home page: pitch + sign-in CTA on the left, a live-looking dashboard mockup on the right. */
export function HeroSection() {
  return (
    <section aria-labelledby="hero-title" className="relative isolate overflow-hidden pb-16 pt-10 sm:pb-24 sm:pt-14 lg:pb-28 lg:pt-20">
      <HeroBackground />
      <LandingContainer className="grid items-center gap-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-12">
        <HeroCopy />
        <HeroVisual />
      </LandingContainer>
    </section>
  );
}
