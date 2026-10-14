import { cn } from "@/lib/site/cn";

type AuroraProps = {
  /** `panel` sits on the deep purple band; `page` sits on the light ground. */
  variant?: "panel" | "page";
  className?: string;
};

/*
 * A gradient mesh: several soft colour fields, each on its own loop length and
 * phase, so they never line up the same way twice. Purple carries it, a little
 * pink and indigo keep it from reading as one flat wash. Every blob is a
 * transform-only CSS animation (`.aurora-blob`), parked on phones and under
 * reduced motion by the rules in `site.css`.
 */
const BLOBS = {
  panel: [
    "left-[-10%] top-[-30%] size-[38rem] bg-brand-500/55 [animation-duration:18s]",
    "right-[-8%] top-[-20%] size-[30rem] bg-accent-500/45 [animation-delay:-6s] [animation-duration:23s]",
    "left-[30%] top-[25%] size-[26rem] bg-tile-indigo/55 [animation-delay:-11s] [animation-duration:15s]",
    "left-[-6%] bottom-[-35%] size-[32rem] bg-brand-400/45 [animation-delay:-3s] [animation-duration:27s]",
    "right-[12%] bottom-[-40%] size-[34rem] bg-brand-700/70 [animation-delay:-16s] [animation-duration:20s]",
  ],
  page: [
    "left-[-12%] top-[-30%] size-[30rem] bg-brand-300/35 [animation-duration:20s]",
    "right-[-6%] top-[-20%] size-[26rem] bg-accent-200/45 [animation-delay:-8s] [animation-duration:26s]",
    "left-[35%] top-[10%] size-[22rem] bg-tile-indigo/12 [animation-delay:-13s] [animation-duration:17s]",
    "right-[25%] bottom-[-45%] size-[24rem] bg-brand-400/20 [animation-delay:-4s] [animation-duration:23s]",
  ],
} as const;

export function Aurora({ variant = "panel", className }: AuroraProps) {
  return (
    <div
      aria-hidden
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
    >
      {BLOBS[variant].map((blob) => (
        <span key={blob} className={cn("aurora-blob", blob)} />
      ))}
    </div>
  );
}
