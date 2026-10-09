import { useEffect } from "react";
import type { Option } from "@/components/shared/OptionSelect";
import { useStudent } from "@/features/students/api";
import { humanize } from "@/lib/format";
import { useServerForm } from "@/lib/use-server-form";
import { useRequestMeeting } from "./api";
import { requestDefaults, requestSchema, toRequestInput } from "./schemas";

/** Staff-initiated meeting: pick a student, then one of their verified guardians. */
export function useRequestMeetingForm(onDone: () => void) {
  const request = useRequestMeeting();
  const { form, submit, submitting, formError } = useServerForm({
    schema: requestSchema,
    defaultValues: requestDefaults(),
    onSubmit: (values) => request.mutateAsync(toRequestInput(values)),
    onSuccess: onDone,
  });

  const studentId = form.watch("studentId");
  const student = useStudent(studentId || null);
  const links = (student.data?.guardians ?? []).filter((link) => link.status === "VERIFIED");
  const guardianOptions: Option[] = links.map((link) => ({
    id: link.guardian.id,
    name: `${link.guardian.name} (${humanize(link.relation)})`,
  }));
  const primaryId = (links.find((link) => link.isPrimary) ?? links[0])?.guardian.id ?? "";

  const { setValue } = form;
  // Validate so a stale "Choose a guardian" error clears once one is filled in.
  useEffect(() => setValue("guardianId", primaryId, { shouldValidate: !!primaryId }), [primaryId, setValue]);

  return {
    form,
    submit,
    submitting,
    formError,
    guardianOptions,
    guardiansLoading: !!studentId && student.isLoading,
    hasStudent: !!studentId,
  };
}
