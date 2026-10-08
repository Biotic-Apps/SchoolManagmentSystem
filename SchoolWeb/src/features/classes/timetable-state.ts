import type { BadgeTone } from "@/components/ui/Badge";
import type { TimetableState } from "@/features/timetable/types";

export const TIMETABLE_STATE_COPY: Record<TimetableState, { label: string; tone: BadgeTone; dot: string }> = {
  EMPTY: { label: "no timetable", tone: "neutral", dot: "bg-border-strong" },
  DRAFT: { label: "draft", tone: "warning", dot: "bg-warning" },
  PUBLISHED: { label: "published", tone: "success", dot: "bg-success" },
  PUBLISHED_WITH_CHANGES: { label: "published, with unpublished changes", tone: "info", dot: "bg-info" },
};
