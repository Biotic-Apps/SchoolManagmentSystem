import { MessageSquareText } from "lucide-react";
import { EmptyState } from "@/components/shared/EmptyState";
import { Badge } from "@/components/ui/Badge";
import { formatDateTime } from "@/lib/format";
import { CATEGORY_TONE, categoryLabel } from "../options";
import type { ProgressNote } from "../types";

interface NotesTimelineProps {
  notes: ProgressNote[];
  /** Staff see whether parents can read each note. */
  showVisibility?: boolean;
  emptyDescription: string;
}

export function NotesTimeline({ notes, showVisibility, emptyDescription }: NotesTimelineProps) {
  if (!notes.length) {
    return <EmptyState icon={MessageSquareText} title="No feedback yet" description={emptyDescription} className="py-6" />;
  }
  const sorted = [...notes].sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return (
    <ol className="flex flex-col">
      {sorted.map((note) => (
        <li key={note.id} className="relative flex gap-3 pb-5 last:pb-0">
          <span aria-hidden className="absolute bottom-0 left-[5px] top-4 w-px bg-border" />
          <span aria-hidden className="mt-1.5 size-[11px] shrink-0 rounded-full border-2 border-primary bg-surface" />
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone={CATEGORY_TONE[note.category] ?? "neutral"}>{categoryLabel(note.category)}</Badge>
              {showVisibility &&
                (note.visibleToParent ? <Badge tone="info">Visible to parents</Badge> : <Badge>Staff only</Badge>)}
            </div>
            <p className="whitespace-pre-wrap break-words text-label text-fg">{note.note}</p>
            <p className="text-caption text-fg-muted">
              {[note.author?.name, formatDateTime(note.createdAt)].filter(Boolean).join(" · ")}
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}
