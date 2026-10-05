import { useServerForm } from "@/lib/use-server-form";
import { useSaveCalendarEvent } from "./api";
import { eventFormDefaults, eventSchema, toEventInput, type EventFormValues } from "./schemas";
import type { CalendarEvent } from "./types";

interface EventFormContext {
  event: CalendarEvent | null;
  schoolId: string | null;
  branchId: string | null;
}

export function useEventForm(context: EventFormContext, onDone: () => void) {
  const save = useSaveCalendarEvent();
  return useServerForm<EventFormValues>({
    schema: eventSchema,
    defaultValues: eventFormDefaults(context.event),
    onSubmit: (values) => save.mutateAsync({ id: context.event?.id, input: toEventInput(values, context) }),
    onSuccess: onDone,
  });
}
