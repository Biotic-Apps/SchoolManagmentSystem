import { GraduationCap } from "lucide-react";
import { cn } from "@/lib/site/cn";
import { BRAND } from "@/lib/brand";

/**
 * The product's mark — the same purple gradient tile with a graduation cap that
 * the app's own sidebar and sign-in screen wear (`components/shared/AppLogo`).
 */
export function Logo({
  className,
  onDark = false,
}: {
  className?: string;
  onDark?: boolean;
}) {
  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      <span
        className={cn(
          "grid size-9 shrink-0 place-items-center rounded-[0.75rem] text-white",
          onDark
            ? "bg-white/15 ring-1 ring-white/25"
            : "bg-[linear-gradient(140deg,#9B8BF4,#7B68EE_55%,#6A5ACD)] shadow-[inset_0_1px_0_rgb(255_255_255/0.2),0_2px_6px_-2px_rgb(123_104_238/0.55)]",
        )}
      >
        <GraduationCap aria-hidden className="size-5" strokeWidth={2} />
      </span>
      <span
        className={cn(
          "text-[1.15rem] font-bold tracking-tight",
          onDark ? "text-white" : "text-foreground",
        )}
      >
        {BRAND}
      </span>
    </span>
  );
}
