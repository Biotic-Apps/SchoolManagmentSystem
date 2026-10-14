import { cn } from "@/lib/site/cn";

type AuroraProps = {
  /** `panel` sits on the purple gradient; `page` sits on the light background. */
  variant?: "panel" | "page";
  className?: string;
};

const BLOBS = {
  panel: [
    "left-[-12%] top-[-18%] size-[46rem] bg-brand-300/50 [animation-duration:19s]",
    "right-[-16%] top-[6%] size-[40rem] bg-brand-100/35 [animation-delay:-7s] [animation-duration:25s]",
    "left-[24%] bottom-[-26%] size-[44rem] bg-brand-600/55 [animation-delay:-14s] [animation-duration:16s]",
  ],
  page: [
    "left-[-14%] top-[-10%] size-[34rem] bg-brand-400/14",
    "right-[-12%] bottom-[-16%] size-[30rem] bg-tile-indigo/12 [animation-delay:-9s] [animation-duration:27s]",
  ],
} as const;

/**
 * Slow-moving colour fields behind a section. Purely atmospheric — it is what
 * stops a flat gradient from looking like a flat gradient.
 */
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
