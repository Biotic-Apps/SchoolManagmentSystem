import { useFieldArray, useWatch } from "react-hook-form";
import { useServerForm } from "@/lib/use-server-form";
import { arrayError } from "./array-error";
import {
  blankRequestLine,
  lineTotalMinor,
  purchaseRequestDefaults,
  purchaseRequestSchema,
  toPurchaseRequestInput,
} from "./purchase-request-schemas";
import { useCreatePurchaseRequest } from "./purchasing-api";

export function usePurchaseRequestForm(branchId: string, onDone: () => void) {
  const create = useCreatePurchaseRequest();
  const { form, submit, submitting, formError } = useServerForm({
    schema: purchaseRequestSchema,
    defaultValues: purchaseRequestDefaults,
    onSubmit: (values) => create.mutateAsync(toPurchaseRequestInput(branchId, values)),
    onSuccess: onDone,
  });
  const rows = useFieldArray({ control: form.control, name: "lines" });
  const lines = useWatch({ control: form.control, name: "lines" });
  const lineTotals = (lines ?? []).map(lineTotalMinor);

  return {
    form,
    submit,
    submitting,
    formError,
    rows: rows.fields,
    addRow: () => rows.append({ ...blankRequestLine }),
    removeRow: rows.remove,
    lineTotals,
    total: lineTotals.reduce((sum, value) => sum + value, 0),
    linesError: arrayError(form.formState.errors, "lines"),
  };
}
