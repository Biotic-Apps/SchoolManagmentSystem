import { AppBadge } from "@/components/site/app/AppBadge";
import { AppFeatureList } from "@/components/site/app/AppFeatureList";
import { AppPhones } from "@/components/site/app/AppPhones";
import { Reveal, RevealWords } from "@/components/site/motion/Reveal";
import { EyebrowPill } from "@/components/site/ui/Badge";
import { ANDROID_APP_COPY as COPY } from "@/lib/site/content";

/**
 * The Android app band: deep purple, the app's promises on the left and two
 * floating phones on the right acting out an offline register syncing.
 */
export function AndroidApp() {
  return (
    <section id="android-app" className="relative isolate overflow-hidden bg-brand-900">
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(90%_80%_at_85%_40%,var(--color-brand-600),transparent_60%),radial-gradient(70%_60%_at_0%_100%,rgb(236_72_153/0.22),transparent_60%),linear-gradient(160deg,var(--color-brand-800),var(--color-brand-900))]"
      />
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent"
      />

      <div className="mx-auto grid max-w-7xl items-center gap-14 px-5 py-24 sm:px-8 sm:py-28 lg:grid-cols-[1.05fr_1fr] lg:gap-10 lg:py-32">
        <div>
          <Reveal className="mb-5 flex">
            <EyebrowPill onDark>{COPY.eyebrow}</EyebrowPill>
          </Reveal>
          <RevealWords
            text={COPY.title}
            highlight={2}
            highlightClassName="bg-gradient-to-r from-white via-brand-100 to-accent-200 bg-clip-text text-transparent"
            className="text-balance text-[2rem] font-bold leading-[1.1] tracking-[-0.03em] text-white sm:text-[2.5rem] lg:text-[2.8rem]"
          />
          <Reveal delay={0.2}>
            <p className="mt-5 max-w-xl text-pretty leading-relaxed text-white/75">{COPY.body}</p>
          </Reveal>
          <AppFeatureList />
          <Reveal delay={0.4}>
            <AppBadge />
          </Reveal>
        </div>
        <AppPhones />
      </div>
    </section>
  );
}
