import { todayIso } from "@/lib/dates";
import { useServerForm } from "@/lib/use-server-form";
import { useAcceptMeeting } from "./api";
import { acceptSchema, toAcceptInput } from "./schemas";
import type { Meeting } from "./types";

/** Confirm a parent's request at their suggested time, or change it first. */
export function useAcceptForm(meeting: Meeting, onDone: () => void) {
  const accept = useAcceptMeeting(meeting.id);
  // A suggestion for a day that has passed must move to today or later.
  const date = meeting.date < todayIso() ? todayIso() : meeting.date;
  return useServerForm({
    schema: acceptSchema,
    defaultValues: {
      date,
      startTime: meeting.startTime,
      endTime: meeting.endTime,
      mode: meeting.mode,
      location: meeting.location ?? "",
    },
    onSubmit: (values) => accept.mutateAsync(toAcceptInput(values)),
    onSuccess: onDone,
  });
}
