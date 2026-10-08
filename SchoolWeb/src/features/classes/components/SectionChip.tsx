import { UserRound } from "lucide-react";
import { cn } from "@/lib/cn";
import type { OverviewSection } from "../setup-types";

/** "A · Science · Ms Sana", or a soft warning when the section has no class teacher. */
export function SectionChip({ section }: { section: OverviewSection }) {
  const teacher = section.classTeacher?.name;
  return (
    <span
      className={cn(
        "inline-flex max-w-full items-center gap-1.5 rounded-full border px-2.5 py-1 text-caption",
        teacher ? "border-border bg-background text-fg" : "border-warning/30 bg-warning-soft text-warning",
      )}
    >
      <span className="font-semibold">{section.name}</span>
      {section.group && <span className="text-fg-muted">· {section.group}</span>}
      <span aria-hidden className="text-fg-muted">
        ·
      </span>
      <UserRound className="size-3 shrink-0" aria-hidden />
      <span className="truncate">{teacher ?? "No class teacher"}</span>
    </span>
  );
}
