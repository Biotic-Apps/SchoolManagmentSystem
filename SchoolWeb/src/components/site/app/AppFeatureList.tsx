import { BellRing, Fingerprint, NotebookPen, WifiOff, type LucideIcon } from "lucide-react";
import { Reveal } from "@/components/site/motion/Reveal";
import { ANDROID_APP_COPY as COPY } from "@/lib/site/content";

const ICONS: Record<(typeof COPY.features)[number]["icon"], LucideIcon> = {
  offline: WifiOff,
  diary: NotebookPen,
  bell: BellRing,
  lock: Fingerprint,
};

/** The four things the app does, each a frosted icon tile and two lines. */
export function AppFeatureList() {
  return (
    <ul className="mt-10 grid gap-6 sm:grid-cols-2 sm:gap-x-8">
      {COPY.features.map((feature, index) => {
        const Icon = ICONS[feature.icon];
        return (
          <Reveal as="li" key={feature.title} delay={0.1 + index * 0.08} className="flex gap-4">
            <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-white/10 text-white ring-1 ring-inset ring-white/20">
              <Icon className="size-5" strokeWidth={2} />
            </span>
            <span>
              <span className="block font-semibold text-white">{feature.title}</span>
              <span className="mt-1 block text-[0.92rem] leading-relaxed text-white/70">{feature.body}</span>
            </span>
          </Reveal>
        );
      })}
    </ul>
  );
}
