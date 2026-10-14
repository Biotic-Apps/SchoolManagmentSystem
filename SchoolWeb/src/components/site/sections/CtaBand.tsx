import { ArrowRight, LogIn, Mail } from "lucide-react";
import { Button } from "@/components/site/ui/Button";
import { EyebrowPill } from "@/components/site/ui/Badge";
import { Reveal, RevealWords } from "@/components/site/motion/Reveal";
import { Aurora } from "@/components/site/motion/Aurora";
import { IconDrift } from "@/components/site/cta/IconDrift";
import { Magnetic } from "@/components/site/cta/Magnetic";
import { Particles } from "@/components/site/cta/Particles";
import { SIGN_IN_URL } from "@/lib/site/links";
import { CTA_COPY } from "@/lib/site/content";

/**
 * The closing band: deep purple, a moving gradient mesh, a drifting wall of
 * school icons and a few floating points of light, with the headline lifting
 * in word by word and two magnetic buttons.
 */
export function CtaBand() {
  return (
    <section className="relative isolate overflow-hidden bg-brand-900">
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(120%_90%_at_50%_0%,var(--color-brand-700),var(--color-brand-900)_70%)]"
      />
      <Aurora variant="panel" />
      <IconDrift />
      <Particles />
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent"
      />

      <div className="relative mx-auto max-w-4xl px-5 py-24 text-center sm:px-8 sm:py-32">
        {CTA_COPY.eyebrow ? (
          <Reveal className="mb-6 flex justify-center">
            <EyebrowPill onDark>{CTA_COPY.eyebrow}</EyebrowPill>
          </Reveal>
        ) : null}

        <RevealWords
          text={CTA_COPY.title}
          highlight={2}
          highlightClassName="bg-gradient-to-r from-white via-brand-100 to-accent-200 bg-clip-text text-transparent"
          className="text-balance text-[2.1rem] font-bold leading-[1.08] tracking-[-0.03em] text-white sm:text-5xl lg:text-[3.6rem]"
        />

        <Reveal delay={0.35}>
          <p className="mx-auto mt-6 max-w-xl text-pretty leading-relaxed text-white/75">
            {CTA_COPY.body}
          </p>
        </Reveal>

        <Reveal delay={0.45}>
          <div className="mt-10 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center sm:gap-4">
            <Magnetic>
              <Button
                href={SIGN_IN_URL}
                variant="onDark"
                size="lg"
                className="group w-full shadow-[0_14px_34px_-12px_rgb(0_0_0/0.5)] sm:w-auto"
              >
                <LogIn className="size-4" strokeWidth={2.2} />
                {CTA_COPY.signIn}
                <ArrowRight
                  className="size-4 transition-transform duration-300 group-hover:translate-x-1"
                  strokeWidth={2.2}
                />
              </Button>
            </Magnetic>
            <Magnetic>
              <Button
                href="/contact"
                size="lg"
                variant="outlineOnDark"
                className="w-full backdrop-blur-sm sm:w-auto"
              >
                <Mail className="size-4" strokeWidth={2.2} />
                {CTA_COPY.contact}
              </Button>
            </Magnetic>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
