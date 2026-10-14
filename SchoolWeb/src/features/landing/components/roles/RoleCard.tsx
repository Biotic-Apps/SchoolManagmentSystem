import type { CSSProperties } from "react";
import { cn } from "@/lib/cn";
import type { LandingRole } from "./roleData";

interface RoleButtonProps {
  role: LandingRole;
  active: boolean;
  /** Show the 5s progress fill on the active item (auto-advance running). */
  showProgress: boolean;
  intervalMs: number;
  onSelect: () => void;
}

/** Desktop role list row: icon, name and a short line. Active row turns purple with a progress fill. */
export function RoleCard({ role, active, showProgress, intervalMs, onSelect }: RoleButtonProps) {
  const Icon = role.icon;
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={active}
      className={cn(
        "group relative flex w-full items-center gap-3 overflow-hidden rounded-tile px-4 py-3 text-left",
        "transition-[background-color,box-shadow,color] duration-300 ease-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
        active ? "bg-primary text-white shadow-raised" : "text-fg hover:bg-selected",
      )}
    >
      <span
        className={cn(
          "grid size-10 shrink-0 place-items-center rounded-tile transition-colors duration-300",
          active ? "bg-white/15 text-white" : "bg-selected text-primary group-hover:bg-white",
        )}
      >
        <Icon className="size-5" aria-hidden />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-label font-semibold">{role.name}</span>
        <span className={cn("block truncate text-caption", active ? "text-white/75" : "text-fg-muted")}>{role.tagline}</span>
      </span>
      {active && (
        <span className="absolute inset-y-3 left-0 w-1 rounded-r-full bg-white transition-all starting:inset-y-1/2 duration-300" aria-hidden />
      )}
      {active && showProgress && (
        <span className="absolute inset-x-0 bottom-0 h-0.5 bg-white/20" aria-hidden>
          <span
            className="block h-full w-full bg-white/80 transition-[width] ease-linear starting:w-0"
            style={{ transitionDuration: `${intervalMs}ms` } as CSSProperties}
          />
        </span>
      )}
    </button>
  );
}

/** Mobile chip for the horizontally scrolling role row. */
export function RoleChip({ role, active, onSelect }: Pick<RoleButtonProps, "role" | "active" | "onSelect">) {
  const Icon = role.icon;
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={active}
      data-active={active || undefined}
      className={cn(
        "inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-label font-semibold ring-1 ring-inset",
        "transition-[background-color,color,box-shadow] duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
        active ? "bg-primary text-white shadow-raised ring-primary" : "bg-white text-fg ring-border hover:bg-selected",
      )}
    >
      <Icon className="size-4" aria-hidden />
      {role.name}
    </button>
  );
}
