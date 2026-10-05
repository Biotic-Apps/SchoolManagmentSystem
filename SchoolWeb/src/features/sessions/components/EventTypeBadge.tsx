import { Badge } from "@/components/ui/Badge";
import { eventTypeLabel, eventTypeTone } from "../event-types";
import type { CalendarEventType } from "../types";

export function EventTypeBadge({ type }: { type: CalendarEventType }) {
  return <Badge tone={eventTypeTone(type)}>{eventTypeLabel(type)}</Badge>;
}
