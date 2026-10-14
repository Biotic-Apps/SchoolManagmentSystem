import { Reveal } from "@/components/site/motion/Reveal";
import { AnimatedHeading } from "@/components/site/motion/AnimatedHeading";

/**
 * Opening block for the pages that are not the home page.
 *
 * Kept on the same quiet ground as the rest of the site — a legal page wearing
 * a full brand panel looks like marketing, which is the last thing terms and a
 * privacy policy should look like.
 */
export function PageHeader({
  eyebrow,
  title,
  body,
}: {
  eyebrow?: string;
  title: string;
  body?: string;
}) {
  return (
    <section className="relative overflow-hidden border-b border-line">
      <div aria-hidden className="hero-canvas absolute inset-0 opacity-70" />

      <div className="relative mx-auto max-w-4xl px-5 pb-14 pt-32 sm:px-8 sm:pb-16 sm:pt-40">
        {eyebrow ? (
          <Reveal>
            <p className="flex items-center gap-2 text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-brand-700">
              <span className="h-px w-6 bg-brand-500" />
              {eyebrow}
            </p>
          </Reveal>
        ) : null}

        <AnimatedHeading
          as="h1"
          text={title}
          delay={0.06}
          className="mt-4 text-balance text-[2.2rem] font-semibold leading-[1.1] tracking-[-0.03em] sm:text-[2.9rem]"
        />

        {body ? (
          <Reveal delay={0.3}>
            <p className="mt-5 max-w-2xl text-pretty leading-[1.65] text-muted">{body}</p>
          </Reveal>
        ) : null}
      </div>
    </section>
  );
}
