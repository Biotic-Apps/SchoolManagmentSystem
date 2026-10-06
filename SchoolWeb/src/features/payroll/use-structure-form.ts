import { useFieldArray } from "react-hook-form";
import { toMoneyText } from "@/lib/money";
import { currentPeriod } from "@/lib/period";
import { useServerForm } from "@/lib/use-server-form";
import { structureSchema, toStructureInput, type StructureValues } from "./schemas";
import { useSaveSalaryStructure } from "./structure-api";
import type { SalaryItem, SalaryStructure } from "./types";

const toRows = (items: SalaryItem[] | undefined) =>
  (items ?? []).map((item) => ({ name: item.name, amount: toMoneyText(item.amountMinor) }));

function defaults(current: SalaryStructure | null): StructureValues {
  return {
    effectiveFrom: currentPeriod(),
    basic: toMoneyText(current?.basicMinor),
    allowances: toRows(current?.allowances),
    deductions: toRows(current?.deductions),
  };
}

/** New structure version prefilled from the current one; earlier versions stay in history. */
export function useStructureForm(staffId: string, current: SalaryStructure | null, onDone: () => void) {
  const save = useSaveSalaryStructure(staffId);
  const server = useServerForm({
    schema: structureSchema,
    defaultValues: defaults(current),
    onSubmit: (values) => save.mutateAsync(toStructureInput(values)),
    onSuccess: onDone,
  });
  const allowances = useFieldArray({ control: server.form.control, name: "allowances" });
  const deductions = useFieldArray({ control: server.form.control, name: "deductions" });
  return { ...server, allowances, deductions };
}

export type StructureFormState = ReturnType<typeof useStructureForm>;
