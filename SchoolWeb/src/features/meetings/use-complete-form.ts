import { useFieldArray } from "react-hook-form";
import type { Option } from "@/components/shared/OptionSelect";
import { useCurrentUserId } from "@/features/auth/use-can";
import { addDays, todayIso } from "@/lib/dates";
import { useServerForm } from "@/lib/use-server-form";
import { useCompleteMeeting } from "./api";
import { completeDefaults, completeSchema, toCompleteInput } from "./schemas";
import type { Meeting } from "./types";

/** Notes, optional parent summary and follow-up tasks (owned by the current user by default). */
export function useCompleteForm(meeting: Meeting, onDone: () => void) {
  const me = useCurrentUserId();
  const complete = useCompleteMeeting(meeting.id);
  const { form, submit, submitting, formError } = useServerForm({
    schema: completeSchema,
    defaultValues: completeDefaults,
    onSubmit: (values) => complete.mutateAsync(toCompleteInput(values)),
    onSuccess: onDone,
  });
  const followUps = useFieldArray({ control: form.control, name: "followUps" });

  const ownerOptions: Option[] = me ? [{ id: me, name: "Me" }] : [];

  return {
    form,
    submit,
    submitting,
    formError,
    sharing: form.watch("shareSummaryWithParent"),
    followUps: followUps.fields,
    ownerOptions,
    addFollowUp: () => followUps.append({ title: "", ownerUserId: me ?? "", dueDate: addDays(todayIso(), 7) }),
    removeFollowUp: followUps.remove,
  };
}
