import { useServerForm } from "@/lib/use-server-form";
import { useAddPayrollAdjustment } from "./adjustments-api";
import { adjustmentSchema, toAdjustmentInput } from "./schemas";

export function useAdjustmentForm(month: string, staffId: string | undefined, onDone: () => void) {
  const add = useAddPayrollAdjustment();
  return useServerForm({
    schema: adjustmentSchema,
    defaultValues: { staffId: staffId ?? "", month, kind: "", amount: "", reason: "" },
    onSubmit: (values) => add.mutateAsync(toAdjustmentInput(values)),
    onSuccess: onDone,
  });
}
