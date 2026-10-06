import { useWatch } from "react-hook-form";
import type { Option } from "@/components/shared/OptionSelect";
import { hasErrorCode } from "@/lib/api-error";
import { errorMessage } from "@/lib/error-messages";
import { useServerForm } from "@/lib/use-server-form";
import { movementDefaults, movementSchema, toMovementInput } from "./movement-schemas";
import { useRecordMovement, useStock } from "./stock-api";

export function useMovementForm(branchId: string, branchOptions: Option[], onDone: () => void) {
  const record = useRecordMovement();
  const stock = useStock(branchId);

  const { form, submit, submitting, formError } = useServerForm({
    schema: movementSchema,
    defaultValues: movementDefaults,
    onSubmit: async (values) => {
      try {
        await record.mutateAsync(toMovementInput(branchId, values));
        return true;
      } catch (error) {
        if (!hasErrorCode(error, "NEGATIVE_STOCK")) throw error;
        // Shown on the quantity field instead of the form alert.
        form.setError("quantity", { type: "server", message: errorMessage(error) });
        return false;
      }
    },
    onSuccess: (saved) => saved && onDone(),
  });

  const [type, itemId] = useWatch({ control: form.control, name: ["type", "itemId"] });
  const inStock = stock.data?.find((row) => row.itemId === itemId);

  return {
    form,
    submit,
    submitting,
    formError,
    type,
    inStockHint: itemId && inStock ? `In stock: ${Number(inStock.quantity) || 0}` : undefined,
    targetBranches: branchOptions.filter((option) => option.id !== branchId),
  };
}
