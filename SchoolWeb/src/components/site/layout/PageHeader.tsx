import { Reveal, RevealWords } from "@/components/site/motion/Reveal";
import { Aurora } from "@/components/site/motion/Aurora";
import { EyebrowPill } from "@/components/site/ui/Badge";

/**
 * Opening block for the pages that are not the home page.
 *
 * A light gradient mesh drifts behind it, softer than the closing band, so a
 * legal page still feels calm. The title lifts in word by word and the last
 * word wears the brand ink.
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
    <section className="relative overflow-hidden border-b border-line bg-background">
      <Aurora variant="page" />
      <div aria-hidden className="grid-fade absolute inset-0" />
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-b from-transparent to-background"
      />

      <div className="relative mx-auto max-w-4xl px-5 pb-14 pt-32 sm:px-8 sm:pb-16 sm:pt-40">
        {eyebrow ? (
          <Reveal soft className="flex">
            <EyebrowPill>{eyebrow}</EyebrowPill>
          </Reveal>
        ) : null}

        <RevealWords
          as="h1"
          text={title}
          delay={0.1}
          highlight={1}
          className="mt-5 text-balance text-[2.2rem] font-semibold leading-[1.1] tracking-[-0.03em] sm:text-[2.9rem]"
        />

        {body ? (
          <Reveal delay={0.35}>
            <p className="mt-5 max-w-2xl text-pretty leading-[1.65] text-muted">{body}</p>
          </Reveal>
        ) : null}
      </div>
    </section>
  );
}
