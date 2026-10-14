import type { ReactNode, Ref } from "react";

type MiniFrameProps = {
  children: ReactNode;
  frameRef?: Ref<HTMLDivElement>;
};

/** The small white screen every card illustration sits in. */
export function MiniFrame({ children, frameRef }: MiniFrameProps) {
  return (
    <div
      ref={frameRef}
      aria-hidden
      className="relative h-[104px] overflow-hidden rounded-xl border border-line bg-white p-3 text-[0.72rem] text-foreground"
    >
      {children}
    </div>
  );
}

/** A little rounded tag in the card's own colour of the day. */
export function Tag({ children, color }: { children: ReactNode; color: string }) {
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[0.64rem] font-semibold text-white"
      style={{ backgroundColor: color }}
    >
      {children}
    </span>
  );
}
