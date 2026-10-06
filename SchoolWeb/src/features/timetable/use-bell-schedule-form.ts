import { useFieldArray } from "react-hook-form";
import { useServerForm } from "@/lib/use-server-form";
import { useSavePeriods } from "./api";
import { bellScheduleDefaults, bellScheduleSchema, nextPeriodRow, toPeriods, type BellScheduleValues } from "./schemas";
import type { Period } from "./types";

/** Bell schedule editor; row order defines the period index (1..n). */
export function useBellScheduleForm(branchId: string, periods: Period[]) {
  const save = useSavePeriods(branchId);
  const server = useServerForm<BellScheduleValues>({
    schema: bellScheduleSchema,
    defaultValues: bellScheduleDefaults(periods),
    onSubmit: (values) => save.mutateAsync(toPeriods(values)),
  });
  const { form } = server;
  const rows = useFieldArray({ control: form.control, name: "periods" });
  const listError = form.formState.errors.periods?.root?.message ?? form.formState.errors.periods?.message;

  return {
    ...server,
    fields: rows.fields,
    listError,
    dirty: form.formState.isDirty,
    add: () => rows.append(nextPeriodRow(form.getValues("periods").at(-1))),
    remove: rows.remove,
    moveUp: (index: number) => index > 0 && rows.move(index, index - 1),
    moveDown: (index: number) => index < rows.fields.length - 1 && rows.move(index, index + 1),
    discard: () => form.reset(),
  };
}

export type BellScheduleForm = ReturnType<typeof useBellScheduleForm>;
