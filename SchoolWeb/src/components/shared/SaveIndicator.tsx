import { CircleAlert, CircleCheck } from "lucide-react";
import { Spinner } from "@/components/ui/Spinner";
import { cn } from "@/lib/cn";
import type { SaveStatus } from "@/lib/use-save-status";

const COPY: Record<Exclude<SaveStatus, "idle">, string> = {
  saving: "Saving…",
  saved: "All changes saved",
  error: "Last change not saved",
};

/** "Saving…" / "All changes saved" next to autosaving screens; nothing before the first change. */
export function SaveIndicator({ status, className }: { status: SaveStatus; className?: string }) {
  if (status === "idle") return null;
  return (
    <span
      role="status"
      aria-live="polite"
      className={cn(
        "inline-flex items-center gap-1.5 text-caption",
        status === "error" ? "text-error" : "text-fg-muted",
        className,
      )}
    >
      {status === "saving" && <Spinner className="size-3.5" />}
      {status === "saved" && <CircleCheck className="size-3.5 text-success" aria-hidden />}
      {status === "error" && <CircleAlert className="size-3.5" aria-hidden />}
      {COPY[status]}
    </span>
  );
}
