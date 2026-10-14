import { ArrowRight, Check } from "lucide-react";
import { Reveal } from "@/components/site/motion/Reveal";
import { HeroBackground } from "@/components/site/hero/HeroBackground";
import { HeroCapability } from "@/components/site/hero/HeroCapability";
import { HeroHeadline } from "@/components/site/hero/HeroHeadline";
import { HeroVisual } from "@/components/site/hero/HeroVisual";
import { MagneticLink } from "@/components/site/hero/MagneticLink";
import { HERO_COPY, HERO_PROOFS } from "@/lib/site/content";
import { SIGN_IN_URL } from "@/lib/site/links";
import "@/components/site/hero/hero.css";

/**
 * A split hero: the pitch on the left with a headline that keeps naming what
 * the school runs, and on the right a layered product composition that
 * answers the pointer and separates as the page scrolls. On phones the two
 * stack, copy first, and the composition drops its orbit and mouse response.
 */
export function Hero() {
  return (
    <section id="top" className="relative overflow-hidden">
      <HeroBackground />

      <div className="relative mx-auto grid max-w-7xl items-center gap-x-10 gap-y-20 px-5 pb-32 pt-28 sm:px-8 sm:pt-32 lg:min-h-[min(100svh,860px)] lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:pb-36 lg:pt-36 xl:gap-x-16">
        <div className="relative z-10 max-w-[36rem]">
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full border border-brand-200/70 bg-white/70 px-3 py-1 text-[0.72rem] font-medium text-brand-800">
              <span className="relative flex size-2">
                <span className="absolute inset-0 animate-ping rounded-full bg-accent-400 opacity-60" />
                <span className="relative size-2 rounded-full bg-gradient-to-br from-brand-500 to-accent-500" />
              </span>
              {HERO_COPY.badge}
            </span>
          </Reveal>

          <HeroHeadline
            label={HERO_COPY.headline}
            lead={HERO_COPY.headlineLead}
            rotating={HERO_COPY.rotating}
            className="mt-6 text-[2.15rem] font-semibold leading-[1.06] tracking-[-0.04em] text-foreground sm:text-[3rem] lg:text-[2.7rem] xl:text-[3.3rem]"
          />

          <Reveal delay={0.5}>
            <p className="mt-6 max-w-lg text-pretty text-[1.02rem] leading-[1.65] text-muted">
              {HERO_COPY.subline}
            </p>
          </Reveal>

          <Reveal delay={0.6}>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <MagneticLink
                href={SIGN_IN_URL}
                className="gradient-button text-white shadow-[0_14px_30px_-12px_rgb(123_104_238/0.7)] hover:shadow-[0_18px_38px_-12px_rgb(236_72_153/0.55)]"
              >
                {HERO_COPY.signIn}
                <ArrowRight
                  className="size-4 transition-transform duration-300 group-hover:translate-x-1"
                  strokeWidth={2.4}
                />
              </MagneticLink>
              <MagneticLink
                href="/#how-it-works"
                strength={0.18}
                className="border border-line-strong bg-white/70 text-foreground hover:border-brand-300 hover:bg-white"
              >
                {HERO_COPY.secondary}
              </MagneticLink>
            </div>
          </Reveal>

          <Reveal delay={0.7}>
            <ul className="mt-8 flex flex-wrap gap-2">
              {HERO_PROOFS.map((proof) => (
                <li
                  key={proof}
                  className="flex items-center gap-1.5 rounded-full bg-brand-50/80 px-3 py-1.5 text-[0.78rem] font-medium text-brand-800"
                >
                  <Check className="size-3.5 shrink-0 text-brand-600" strokeWidth={2.8} />
                  {proof}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>

        <HeroVisual />
      </div>

      <HeroCapability />
    </section>
  );
}
