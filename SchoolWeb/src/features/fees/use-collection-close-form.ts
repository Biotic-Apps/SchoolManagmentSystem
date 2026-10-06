import { useWatch } from "react-hook-form";
import { toMinor } from "@/lib/money";
import { useServerForm } from "@/lib/use-server-form";
import { closeDayDefaults, closeDaySchema, toCloseDayInput, type CloseDayValues } from "./collection-schemas";
import { useCloseDay } from "./collections-api";

/** Close the day's counter: counted cash against expected cash, difference shown live. */
export function useCollectionCloseForm(branchId: string, date: string, expectedCashMinor: number, onDone: () => void) {
  const close = useCloseDay();
  const { form, submit, submitting, formError } = useServerForm<CloseDayValues>({
    schema: closeDaySchema,
    defaultValues: closeDayDefaults,
    onSubmit: (values) => close.mutateAsync(toCloseDayInput(branchId, date, values)),
    onSuccess: onDone,
  });
  const counted = toMinor(useWatch({ control: form.control, name: "cashCounted" }));

  return {
    form,
    submit,
    submitting,
    formError,
    countedMinor: counted,
    differenceMinor: counted === null ? null : counted - expectedCashMinor,
  };
}
