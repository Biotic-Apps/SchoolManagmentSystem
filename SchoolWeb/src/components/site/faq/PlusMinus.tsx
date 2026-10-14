import { cn } from "@/lib/site/cn";

/**
 * A plus that becomes a minus: the vertical bar turns flat and fades into the
 * horizontal one, while the disc fills with purple and turns half a circle.
 */
export function PlusMinus({ open }: { open: boolean }) {
  return (
    <span
      aria-hidden
      className={cn(
        "relative mt-0.5 grid size-8 shrink-0 place-items-center rounded-full transition-[background-color,box-shadow,transform] duration-300",
        open
          ? "gradient-button rotate-180 shadow-[0_8px_18px_-8px_rgb(91_75_199/0.9)]"
          : "bg-surface-sunken ring-1 ring-inset ring-line group-hover:ring-brand-200",
      )}
    >
      <span
        className={cn(
          "absolute h-[2px] w-3 rounded-full transition-colors duration-300",
          open ? "bg-white" : "bg-brand-600",
        )}
      />
      <span
        className={cn(
          "absolute h-3 w-[2px] rounded-full transition-[transform,opacity,background-color] duration-300",
          open ? "rotate-90 scale-y-0 bg-white opacity-0" : "bg-brand-600",
        )}
      />
    </span>
  );
}
