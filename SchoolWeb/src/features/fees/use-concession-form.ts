import { useWatch } from "react-hook-form";
import { useActiveBranches } from "@/features/branches/api";
import { useServerForm } from "@/lib/use-server-form";
import { concessionDefaults, concessionSchema, toConcessionInput, type ConcessionFormValues } from "./concession-schemas";
import { useConcessionHeadOptions, useRequestConcession } from "./concessions-api";

/** Concession request; it applies to invoices only after approval (CONCESSION). */
export function useConcessionForm(branchId: string | null, onDone: () => void) {
  const { branches } = useActiveBranches();
  const schoolId = branches.find((branch) => branch.id === branchId)?.schoolId ?? null;
  const heads = useConcessionHeadOptions(schoolId);
  const request = useRequestConcession();

  const { form, submit, submitting, formError } = useServerForm<ConcessionFormValues>({
    schema: concessionSchema,
    defaultValues: concessionDefaults(),
    onSubmit: (values) => request.mutateAsync(toConcessionInput(values)),
    onSuccess: onDone,
  });
  const type = useWatch({ control: form.control, name: "type" });

  return { form, submit, submitting, formError, headOptions: heads.options, type };
}
