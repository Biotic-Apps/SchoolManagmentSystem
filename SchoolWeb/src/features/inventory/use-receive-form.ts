import { useServerForm } from "@/lib/use-server-form";
import { arrayError } from "./array-error";
import { receiveDefaults, receiveSchema, toReceiveInput } from "./purchase-order-schemas";
import { useReceiveOrder } from "./purchasing-api";
import type { PurchaseOrder } from "./types";

/** Partial receipts are fine; each line starts at its outstanding quantity. */
export function useReceiveForm(order: PurchaseOrder, onDone: () => void) {
  const receive = useReceiveOrder(order.id);
  const { form, submit, submitting, formError } = useServerForm({
    schema: receiveSchema,
    defaultValues: receiveDefaults(order),
    onSubmit: (values) => receive.mutateAsync(toReceiveInput(values)),
    onSuccess: onDone,
  });

  return {
    form,
    submit,
    submitting,
    formError,
    lines: receiveDefaults(order).lines,
    linesError: arrayError(form.formState.errors, "lines"),
  };
}
