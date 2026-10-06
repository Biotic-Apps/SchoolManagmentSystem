import { useFieldArray } from "react-hook-form";
import { useServerForm } from "@/lib/use-server-form";
import { useCreateSlots } from "./api";
import { slotRowDefaults, slotsSchema, toSlotInputs } from "./schemas";

/** One or more slot rows; a new row copies the previous one, 15 minutes later. */
export function useSlotsForm(startDate: string, onDone: () => void) {
  const create = useCreateSlots();
  const { form, submit, submitting, formError } = useServerForm({
    schema: slotsSchema,
    defaultValues: { slots: [slotRowDefaults(startDate)] },
    onSubmit: (values) => create.mutateAsync(toSlotInputs(values)),
    onSuccess: onDone,
  });
  const rows = useFieldArray({ control: form.control, name: "slots" });

  const addRow = () => {
    const last = form.getValues("slots").at(-1) ?? slotRowDefaults(startDate);
    const length = minutes(last.endTime) - minutes(last.startTime);
    rows.append({ ...last, startTime: last.endTime, endTime: toTime(minutes(last.endTime) + Math.max(length, 15)) });
  };

  return { form, submit, submitting, formError, rows: rows.fields, addRow, removeRow: rows.remove };
}

function minutes(value: string): number {
  const [hours, mins] = value.split(":").map(Number);
  return hours * 60 + mins;
}

function toTime(total: number): string {
  const capped = Math.min(total, 23 * 60 + 55);
  return `${String(Math.floor(capped / 60)).padStart(2, "0")}:${String(capped % 60).padStart(2, "0")}`;
}
