import { CtaSection } from "./components/CtaSection";
import { FaqSection } from "./components/FaqSection";
import { FeaturesSection } from "./components/FeaturesSection";
import { HeroSection } from "./components/HeroSection";
import { HowItWorksSection } from "./components/HowItWorksSection";
import { LandingFooter } from "./components/LandingFooter";
import { LandingNav } from "./components/LandingNav";
import { MobileAppSection } from "./components/MobileAppSection";
import { RolesSection } from "./components/RolesSection";
import { SecuritySection } from "./components/SecuritySection";
import { StatsStrip } from "./components/StatsStrip";
import "./landing.css";

/** The public home page: nav → hero → sections → final call to sign in. */
export function LandingPage() {
  return (
    <div className="landing min-h-dvh overflow-x-clip bg-white">
      <LandingNav />
      <main>
        <HeroSection />
        <StatsStrip />
        <FeaturesSection />
        <RolesSection />
        <HowItWorksSection />
        <MobileAppSection />
        <SecuritySection />
        <FaqSection />
        <CtaSection />
      </main>
      <LandingFooter />
    </div>
  );
}
