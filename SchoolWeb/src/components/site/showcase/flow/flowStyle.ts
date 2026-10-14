import { FLOW_COPY, FLOW_DEMO } from "@/lib/site/content";

export const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * From here up the three stages sit in one row joined by scroll drawn lines;
 * below it they stack. Matches Tailwind's `lg`.
 */
export const ROW_QUERY = "(min-width: 1024px)";

export type Status = (typeof FLOW_DEMO.students)[number]["status"];

export const STATUS_STYLE: Record<Status, string> = {
  present: "bg-brand-50 text-brand-700 ring-brand-200",
  absent: "bg-accent-50 text-accent-700 ring-accent-200",
  late: "bg-amber-50 text-amber-700 ring-amber-200",
};

export const STATUS_LABEL: Record<Status, string> = {
  present: FLOW_COPY.present,
  absent: FLOW_COPY.absent,
  late: FLOW_COPY.late,
};
