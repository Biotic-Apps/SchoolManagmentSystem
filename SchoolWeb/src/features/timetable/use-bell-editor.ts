import { useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { hasErrorCode } from "@/lib/api-error";
import { errorDetails, errorMessage } from "@/lib/error-messages";
import { useSaveBellSchedule } from "./bell-api";
import { generateBell, type BellSettings } from "./bell-generator";
import { bellFormDefaults, bellFormSchema, toBellInput, type BellFormValues } from "./bell-schemas";
import type { BellSchedule } from "./builder-types";

/**
 * Bell schedule editor: the default day plus weekday variants (e.g. a short Friday).
 * Saving a change that would drop lessons asks first and then resends with dropLessons.
 */
export function useBellEditor(branchId: string, bell: BellSchedule | null) {
  const save = useSaveBellSchedule(branchId);
  const form = useForm<BellFormValues>({ resolver: zodResolver(bellFormSchema), defaultValues: bellFormDefaults(bell) });
  const schedules = useFieldArray({ control: form.control, name: "schedules", keyName: "key" });
  const [active, setActive] = useState(0);
  const [formError, setFormError] = useState<string | null>(null);
  const [inUse, setInUse] = useState<string[] | null>(null);

  const send = async (values: BellFormValues, dropLessons: boolean) => {
    setFormError(null);
    try {
      await save.mutateAsync(toBellInput(values, dropLessons));
      setInUse(null);
      form.reset(values);
    } catch (error) {
      if (hasErrorCode(error, "PERIODS_IN_USE")) setInUse(errorDetails(error));
      else setFormError(errorMessage(error));
    }
  };

  const days = schedules.fields.map((field) => field.day);
  const workingDays = bell?.workingDays ?? [1, 2, 3, 4, 5, 6];

  return {
    form,
    schedules: schedules.fields,
    active: Math.min(active, schedules.fields.length - 1),
    setActive,
    workingDays,
    /** Working days that still follow the default times. */
    freeDays: workingDays.filter((day) => !days.includes(day)),
    addVariant: (day: number) => {
      const rows = form.getValues("schedules.0.rows");
      schedules.append({ day, rows: rows.map((row) => ({ ...row })) });
      setActive(schedules.fields.length);
    },
    removeVariant: (index: number) => {
      if (index === 0) return;
      schedules.remove(index);
      setActive(0);
    },
    generate: (index: number, settings: BellSettings) =>
      form.setValue(`schedules.${index}.rows`, generateBell(settings), { shouldDirty: true, shouldValidate: true }),
    submit: form.handleSubmit((values) => (save.isPending ? undefined : send(values, false))),
    confirmDrop: () => void send(form.getValues(), true),
    inUse,
    closeInUse: () => setInUse(null),
    formError,
    saving: save.isPending,
    dirty: form.formState.isDirty,
    discard: () => {
      form.reset();
      setActive(0);
    },
  };
}

export type BellEditorState = ReturnType<typeof useBellEditor>;
