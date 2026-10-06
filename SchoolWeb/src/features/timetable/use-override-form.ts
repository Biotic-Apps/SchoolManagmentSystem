import { useSectionOptions } from "@/features/classes/sections-api";
import { useStaffOptions } from "@/features/staff/api";
import { useServerForm } from "@/lib/use-server-form";
import { useCreateOverride, usePeriods } from "./api";
import { periodOptionLabel } from "./grid";
import { overrideSchema, toOverrideInput, type OverrideFormValues } from "./schemas";

/** Assign a substitute for one section period on one date; breaks can't be covered. */
export function useOverrideForm(branchId: string, sessionId: string | null, date: string, onDone: () => void) {
  const create = useCreateOverride();
  const sections = useSectionOptions(branchId, sessionId);
  const periods = usePeriods(branchId);
  const teachers = useStaffOptions(branchId, "TEACHER");

  const periodOptions = (periods.data ?? [])
    .filter((period) => !period.isBreak)
    .sort((a, b) => a.index - b.index)
    .map((period) => ({ id: String(period.index), name: periodOptionLabel(period) }));

  const server = useServerForm<OverrideFormValues>({
    schema: overrideSchema,
    defaultValues: { sectionId: "", date, periodIndex: "", substituteStaffId: "", reason: "" },
    onSubmit: (values) => create.mutateAsync(toOverrideInput(values)),
    onSuccess: onDone,
  });

  return {
    ...server,
    sectionOptions: sections.options,
    periodOptions,
    teacherOptions: teachers.options,
    loading: sections.isLoading || periods.isLoading || teachers.isLoading,
  };
}
