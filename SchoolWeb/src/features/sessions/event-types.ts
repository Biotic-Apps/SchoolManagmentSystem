import type { Option } from "@/components/shared/OptionSelect";
import type { BadgeTone } from "@/components/ui/Badge";
import type { CalendarEventType } from "./types";

export const EVENT_TYPES: CalendarEventType[] = ["HOLIDAY", "VACATION", "DEADLINE", "EVENT"];

const LABELS: Record<CalendarEventType, string> = {
  HOLIDAY: "Holiday",
  VACATION: "Vacation",
  DEADLINE: "Deadline",
  EVENT: "Event",
};

const TONES: Record<CalendarEventType, BadgeTone> = {
  HOLIDAY: "error",
  VACATION: "info",
  DEADLINE: "warning",
  EVENT: "primary",
};

export const EVENT_TYPE_OPTIONS: Option[] = EVENT_TYPES.map((type) => ({ id: type, name: LABELS[type] }));

export function eventTypeLabel(type: CalendarEventType): string {
  return LABELS[type] ?? type;
}

export function eventTypeTone(type: CalendarEventType): BadgeTone {
  return TONES[type] ?? "neutral";
}
