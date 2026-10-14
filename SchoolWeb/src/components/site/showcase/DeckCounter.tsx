/** "01 / 04" and the deck's progress bar, shown at the top of every card. */
export function DeckCounter({
  index,
  total,
  barRef,
}: {
  index: number;
  total: number;
  barRef: (node: HTMLSpanElement | null) => void;
}) {
  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <div className="flex items-center gap-4">
      <span className="text-[0.78rem] font-semibold tabular-nums tracking-[0.08em] text-foreground">
        {pad(index + 1)}
        <span className="text-faint"> / {pad(total)}</span>
      </span>
      <span className="relative h-1 w-28 overflow-hidden rounded-full bg-brand-900/10 sm:w-36">
        <span
          ref={barRef}
          className="absolute inset-0 origin-left rounded-full bg-gradient-to-r from-brand-500 to-accent-500"
          style={{ transform: `scaleX(${(index + 1) / total})` }}
        />
      </span>
    </div>
  );
}
