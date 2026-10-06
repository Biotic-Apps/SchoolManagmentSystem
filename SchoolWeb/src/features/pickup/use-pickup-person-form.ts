import { useServerForm } from "@/lib/use-server-form";
import { useAddPickupPerson } from "./api";
import { PICKUP_PERSON_DEFAULTS, pickupPersonSchema, toPickupPersonInput, type PickupPersonValues } from "./schemas";

export function usePickupPersonForm(studentId: string, onDone: () => void) {
  const add = useAddPickupPerson(studentId);
  return useServerForm<PickupPersonValues>({
    schema: pickupPersonSchema,
    defaultValues: PICKUP_PERSON_DEFAULTS,
    onSubmit: (values) => add.mutateAsync(toPickupPersonInput(values)),
    onSuccess: onDone,
  });
}
