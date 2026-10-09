import type { ReactNode } from "react";
import { CircleAlert, CircleCheck } from "lucide-react";
import { Spinner } from "@/components/ui/Spinner";
import { cn } from "@/lib/cn";
import type { SaveStatus } from "@/lib/use-save-status";

type Shown = Exclude<SaveStatus, "idle">;

const COPY: Record<Shown, string> = {
  saving: "Saving…",
  saved: "All changes saved",
  error: "Last change not saved",
};

const ICON: Record<Shown, ReactNode> = {
  saving: <Spinner className="size-3.5" label="Saving" />,
  saved: <CircleCheck className="size-3.5 text-success" />,
  error: <CircleAlert className="size-3.5" />,
};

const STATES = Object.keys(COPY) as Shown[];

/**
 * "Saving…" / "All changes saved" next to autosaving screens; nothing visible before the first change.
 * Every state sits in the same grid cell and they crossfade, so the row never changes size.
 */
export function SaveIndicator({ status, className }: { status: SaveStatus; className?: string }) {
  return (
    <span className={cn("inline-grid text-caption", className)}>
      <span role="status" aria-live="polite" className="sr-only">
        {status === "idle" ? "" : COPY[status]}
      </span>
      {STATES.map((state) => (
        <span
          key={state}
          aria-hidden
          className={cn(
            "col-start-1 row-start-1 inline-flex items-center gap-1.5 transition-opacity ease-standard",
            state === "error" ? "text-error" : "text-fg-muted",
            state === status ? "opacity-100 duration-(--dur-quick)" : "opacity-0 duration-(--dur-instant)",
          )}
        >
          {ICON[state]}
          {COPY[state]}
        </span>
      ))}
    </span>
  );
}
