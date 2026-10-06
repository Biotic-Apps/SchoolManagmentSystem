import { useFieldArray, useWatch } from "react-hook-form";
import { minor } from "@/features/expenses/amounts";
import { hasErrorCode } from "@/lib/api-error";
import { errorMessage } from "@/lib/error-messages";
import { useServerForm } from "@/lib/use-server-form";
import { arrayError } from "./array-error";
import { useRecordSale } from "./sales-api";
import { blankSaleLine, saleDefaults, saleSchema, toSaleInput } from "./sale-schemas";
import type { ItemLookups } from "./use-item-lookups";

/** Uniform / book sale: issues stock and adds the lines to the student's invoice. */
export function useSaleForm(lookups: ItemLookups) {
  const record = useRecordSale();
  const { form, submit, submitting, formError } = useServerForm({
    schema: saleSchema,
    defaultValues: saleDefaults,
    onSubmit: async (values) => {
      try {
        await record.mutateAsync(toSaleInput(values));
        return true;
      } catch (error) {
        if (!hasErrorCode(error, "NEGATIVE_STOCK")) throw error;
        form.setError("lines", { type: "server", message: errorMessage(error) });
        return false;
      }
    },
    onSuccess: (saved) => saved && form.reset(saleDefaults),
  });
  const rows = useFieldArray({ control: form.control, name: "lines" });
  const lines = useWatch({ control: form.control, name: "lines" });

  const priced = (lines ?? []).map((line) => {
    const price = minor(lookups.byId.get(line.itemId)?.salePriceMinor);
    const quantity = Number(line.quantity) || 0;
    return { price, total: price === null ? 0 : price * quantity };
  });

  return {
    form,
    submit,
    submitting,
    formError,
    rows: rows.fields,
    addRow: () => rows.append({ ...blankSaleLine }),
    removeRow: rows.remove,
    priced,
    total: priced.reduce((sum, line) => sum + line.total, 0),
    linesError: arrayError(form.formState.errors, "lines"),
  };
}
