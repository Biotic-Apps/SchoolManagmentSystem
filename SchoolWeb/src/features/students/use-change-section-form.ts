import { useSectionOptions } from "@/features/classes/sections-api";
import { useServerForm } from "@/lib/use-server-form";
import { changeSectionDefaults, changeSectionSchema, type ChangeSectionValues } from "./action-schemas";
import { useChangeSection } from "./api";
import type { StudentDetail } from "./types";

/** Moves the student to another section of the same branch session. */
export function useChangeSectionForm(student: StudentDetail, onDone: () => void) {
  const change = useChangeSection(student.id);
  const enrollment = student.enrollment;
  const sections = useSectionOptions(enrollment?.branchId ?? null, enrollment?.sessionId ?? null);
  const server = useServerForm<ChangeSectionValues>({
    schema: changeSectionSchema,
    defaultValues: changeSectionDefaults(),
    onSubmit: (values) => change.mutateAsync({ ...values, reason: values.reason.trim() }),
    onSuccess: onDone,
  });
  const options = sections.options.filter((option) => option.id !== enrollment?.sectionId);
  return { ...server, options, loadingOptions: sections.isLoading, isFull: sections.isFull };
}
