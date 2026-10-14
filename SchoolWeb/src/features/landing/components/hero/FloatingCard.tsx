import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";

interface FloatingCardProps {
  icon: LucideIcon;
  /** Tailwind classes for the icon bubble (background + text colour). */
  iconClassName: string;
  title: string;
  detail: ReactNode;
  /** Absolute placement around the mockup (outer box, so the float animation's transform stays free). */
  className?: string;
  delayed?: boolean;
}

/** Frosted notification card that bobs gently beside the dashboard mockup. */
export function FloatingCard({ icon: Icon, iconClassName, title, detail, className, delayed }: FloatingCardProps) {
  return (
    <div aria-hidden className={cn("absolute z-20", className)}>
      <div
        className={cn(
          "landing-glass flex items-center gap-3 rounded-tile py-2.5 pl-2.5 pr-4 shadow-overlay ring-1 ring-white/70",
          delayed ? "animate-float-delayed" : "animate-float",
        )}
      >
        <span className={cn("grid size-9 shrink-0 place-items-center rounded-[10px]", iconClassName)}>
          <Icon className="size-4.5" strokeWidth={2.25} />
        </span>
        <span className="flex min-w-0 flex-col">
          <span className="whitespace-nowrap text-[13px] font-semibold leading-5 text-fg">{title}</span>
          <span className="whitespace-nowrap text-[12px] leading-4 text-fg-muted">{detail}</span>
        </span>
      </div>
    </div>
  );
}
