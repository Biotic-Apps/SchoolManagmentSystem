import { ArrowRight, Check, LogIn } from "lucide-react";
import { Button } from "@/components/site/ui/Button";
import { Reveal } from "@/components/site/motion/Reveal";
import { AnimatedHeading } from "@/components/site/motion/AnimatedHeading";
import { HeroDevice } from "@/components/site/motion/HeroDevice";
import { FloatingIcons } from "@/components/site/motion/FloatingIcons";
import { HERO_CAPABILITY, HERO_COPY, HERO_PROOFS } from "@/lib/site/content";
import { SIGN_IN_URL } from "@/lib/site/links";

/**
 * The product is the hero, not the gradient.
 *
 * Type is deliberately held back from the size it wants to be. A headline big
 * enough to fill the screen pushes the software below the fold, and a visitor
 * who has to scroll to find out what they are buying has already been given a
 * reason to leave. The screen has to be visible before the first scroll.
 */
export function Hero() {
  return (
    <section id="top" className="relative overflow-hidden border-b border-line">
      <div aria-hidden className="hero-canvas absolute inset-0" />
      <div aria-hidden className="grid-fade absolute inset-0" />

      {/* Full-bleed, not inside the container: the tiles are meant to use the
          whole width of the window, and a 1280px box would pin them all into
          two narrow strips. The extra top padding at xl opens the band above
          the badge where the highest tiles sit. */}
      <FloatingIcons />

      <div className="stage-3d relative mx-auto max-w-7xl px-5 pb-20 pt-28 sm:px-8 sm:pb-24 sm:pt-32 xl:pt-[13rem]">
        <div className="relative mx-auto max-w-2xl text-center">
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1 text-[0.7rem] font-medium text-muted shadow-[var(--shadow-card)]">
              <span className="size-1.5 rounded-full bg-brand-500" />
              {HERO_COPY.badge}
            </span>
          </Reveal>

          <AnimatedHeading
            as="h1"
            text={HERO_COPY.headline}
            delay={0.08}
            className="mt-5 text-balance text-[2.1rem] font-semibold leading-[1.06] tracking-[-0.035em] text-foreground sm:text-[2.7rem] lg:text-[3.1rem]"
          />

          <Reveal delay={0.34}>
            <p className="mx-auto mt-4 max-w-xl text-pretty text-[1rem] leading-[1.6] text-muted">
              {HERO_COPY.subline}
            </p>
          </Reveal>

          <Reveal delay={0.42}>
            <div className="mt-7 flex flex-col items-center justify-center gap-2.5 sm:flex-row">
              <Button href={SIGN_IN_URL} size="lg">
                <LogIn className="size-4" strokeWidth={2.2} />
                {HERO_COPY.signIn}
              </Button>
              <Button href="/#how-it-works" variant="secondary" size="lg">
                {HERO_COPY.secondary}
                <ArrowRight className="size-4" strokeWidth={2.2} />
              </Button>
            </div>
          </Reveal>

          <Reveal delay={0.5}>
            <ul className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
              {HERO_PROOFS.map((proof) => (
                <li key={proof} className="flex items-center gap-1.5 text-[0.82rem] text-faint">
                  <Check className="size-3.5 shrink-0 text-brand-600" strokeWidth={2.8} />
                  {proof}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>

        <div className="relative mt-12 sm:mt-14">
          <HeroDevice />
        </div>
      </div>

      <div className="relative border-t border-line bg-surface/70 backdrop-blur-sm">
        <div className="mx-auto grid max-w-7xl grid-cols-2 divide-x divide-line px-5 sm:px-8 lg:grid-cols-4">
          {HERO_CAPABILITY.map((item, index) => (
            <div
              key={item.label}
              className={index < 2 ? "border-b border-line px-6 py-5 lg:border-b-0" : "px-6 py-5"}
            >
              <p className="text-[1.35rem] font-semibold leading-none tracking-[-0.03em] text-brand-700">
                {item.figure}
              </p>
              <p className="mt-1.5 text-[0.8rem] text-muted">{item.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
