import { cn } from "@/lib/cn";

interface CountBadgeProps {
  count: number | null | undefined;
  className?: string;
}

/** Small burgundy pill for unread / pending counts; hidden at zero. */
export function CountBadge({ count, className }: CountBadgeProps) {
  if (!count) return null;
  return (
    <span
      className={cn(
        "inline-grid h-5 min-w-5 shrink-0 place-items-center rounded-full bg-primary px-1.5 text-caption font-semibold tabular-nums text-on-primary",
        className,
      )}
    >
      {count > 99 ? "99+" : count}
    </span>
  );
}
