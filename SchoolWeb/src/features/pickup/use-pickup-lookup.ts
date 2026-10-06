import { useForm, useWatch } from "react-hook-form";

/** Student picker that drives the authorized-persons lookup. */
export function usePickupLookup() {
  const form = useForm<{ studentId: string }>({ defaultValues: { studentId: "" } });
  const studentId = useWatch({ control: form.control, name: "studentId" });
  return { form, studentId: studentId || null };
}
