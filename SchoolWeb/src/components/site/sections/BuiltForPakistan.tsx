import { Reveal } from "@/components/site/motion/Reveal";
import { AnimatedHeading } from "@/components/site/motion/AnimatedHeading";
import { FactsMasonry } from "@/components/site/pakistan/FactsMasonry";
import { LocalMarquee } from "@/components/site/pakistan/LocalMarquee";
import { PAKISTAN_COPY } from "@/lib/site/content";

/**
 * The details most imported school software gets wrong: the currency, the
 * session calendar, the phones parents actually carry and the internet a
 * classroom actually has. Set on the page's one dark band so it reads as a
 * statement, not another feature list.
 */
export function BuiltForPakistan() {
  return (
    <section
      id="built-for-pakistan"
      className="relative isolate overflow-hidden bg-[linear-gradient(160deg,#1e1650_0%,#2a1f6b_45%,#3b2d8f_100%)] py-24 text-white sm:py-28 lg:py-32"
    >
      {/* Ambient light and a faint dot grid, all static and behind the content. */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -left-60 -top-40 size-[48rem] rounded-full bg-[radial-gradient(closest-side,rgb(123_104_238/0.32),transparent)]" />
        <div className="absolute -bottom-40 -right-52 size-[44rem] rounded-full bg-[radial-gradient(closest-side,rgb(236_72_153/0.22),transparent)]" />
        <div className="absolute inset-0 bg-[radial-gradient(rgb(255_255_255/0.07)_1px,transparent_1px)] [background-size:26px_26px] [mask-image:linear-gradient(180deg,black,transparent_85%)]" />
      </div>

      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="max-w-3xl">
          <Reveal>
            <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-3.5 py-1.5 text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-brand-200">
              <span
                aria-hidden
                className="size-1.5 rounded-full bg-accent-400"
              />
              {PAKISTAN_COPY.eyebrow}
            </p>
          </Reveal>
          <AnimatedHeading
            text={PAKISTAN_COPY.title}
            delay={0.05}
            className="text-balance text-[2.2rem] font-semibold leading-[1.05] tracking-[-0.035em] sm:text-[3rem] lg:text-[3.75rem]"
          />
          <Reveal delay={0.22}>
            <p className="mt-6 max-w-2xl text-pretty text-[1.05rem] leading-[1.7] text-brand-100/80">
              {PAKISTAN_COPY.body}
            </p>
          </Reveal>
        </div>

        <div className="mt-14 lg:mt-16">
          <FactsMasonry />
        </div>
      </div>

      <div className="mt-12 lg:mt-16">
        <LocalMarquee />
      </div>
    </section>
  );
}
