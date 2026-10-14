import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/** White mini-window frame shared by every visual. */
export function MiniWindow({ title, badge, children }: { title: string; badge?: ReactNode; children: ReactNode }) {
  return (
    <div className="rounded-tile border border-border bg-white/90 p-4 shadow-raised">
      <div className="mb-3 flex items-center justify-between gap-2">
        <span className="truncate text-caption font-semibold text-fg">{title}</span>
        {badge}
      </div>
      {children}
    </div>
  );
}

export function MiniPill({ children, tone = "purple" }: { children: ReactNode; tone?: "purple" | "pink" | "muted" }) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold leading-4",
        tone === "purple" && "bg-selected text-on-selected",
        tone === "pink" && "bg-accent-pink/15 text-accent-pink",
        tone === "muted" && "bg-gray-100 text-fg-muted",
      )}
    >
      {children}
    </span>
  );
}
