import { cn } from "@/lib/cn";
import type { OverviewSection } from "../setup-types";
import { TIMETABLE_STATE_COPY } from "../timetable-state";

/** "Timetable: A published · B draft" with a coloured dot per section. */
export function TimetableStateLine({ sections }: { sections: OverviewSection[] }) {
  if (sections.length === 0) return null;
  return (
    <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-caption text-fg-muted">
      <span className="font-medium">Timetable</span>
      {sections.map((section) => {
        const copy = TIMETABLE_STATE_COPY[section.timetable] ?? TIMETABLE_STATE_COPY.EMPTY;
        return (
          <span key={section.id} className="inline-flex items-center gap-1.5">
            <span aria-hidden className={cn("size-2 rounded-full", copy.dot)} />
            <span className="font-semibold text-fg">{section.name}</span> {copy.label}
          </span>
        );
      })}
    </p>
  );
}
