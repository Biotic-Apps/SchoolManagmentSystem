import { useServerForm } from "@/lib/use-server-form";
import { sectionFormDefaults, sectionSchema, toSectionCreate, toSectionUpdate, type SectionFormValues } from "./schemas";
import { useSaveSection } from "./sections-api";
import type { Section } from "./types";

export interface SectionFormContext {
  branchId: string;
  sessionId: string | null;
  classId: string | undefined;
}

/** Duplicate (session, class, name) comes back as CONFLICT on the name; a closed session as RECORD_LOCKED. */
export function useSectionForm(item: Section | null, context: SectionFormContext, onDone: () => void) {
  const save = useSaveSection();
  return useServerForm<SectionFormValues>({
    schema: sectionSchema,
    defaultValues: sectionFormDefaults(item, context),
    onSubmit: (values) =>
      item
        ? save.mutateAsync({ id: item.id, input: toSectionUpdate(values) })
        : save.mutateAsync({ input: toSectionCreate(values, context.branchId) }),
    onSuccess: onDone,
    conflictField: "name",
  });
}
