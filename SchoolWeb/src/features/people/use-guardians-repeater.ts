import { useFieldArray, useFormContext, useWatch } from "react-hook-form";
import { EMPTY_GUARDIAN, type GuardianEntryValues } from "./schemas";

type GuardiansForm = { guardians: GuardianEntryValues[] };

/** Guardian rows of an application / registration form; marking one primary clears the others. */
export function useGuardiansRepeater() {
  const { control, setValue, formState } = useFormContext<GuardiansForm>();
  const { fields, append, remove } = useFieldArray({ control, name: "guardians" });
  const rows = useWatch({ control, name: "guardians" }) ?? [];

  const makePrimary = (index: number) =>
    rows.forEach((_, rowIndex) =>
      setValue(`guardians.${rowIndex}.isPrimary`, rowIndex === index, { shouldDirty: true, shouldValidate: true }),
    );

  const add = () => append({ ...EMPTY_GUARDIAN, isPrimary: rows.length === 0 });

  const removeRow = (index: number) => {
    const wasPrimary = rows[index]?.isPrimary;
    remove(index);
    if (wasPrimary && rows.length > 1) setValue("guardians.0.isPrimary", true, { shouldValidate: true });
  };

  const errors = formState.errors.guardians;
  const listError = errors?.root?.message ?? errors?.message;

  return { fields, rows, makePrimary, add, removeRow, listError };
}
