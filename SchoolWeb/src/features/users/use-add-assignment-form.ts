import { useServerForm } from "@/lib/use-server-form";
import { useAddAssignment } from "./api";
import { EMPTY_ASSIGNMENT, addAssignmentSchema, toAssignmentInput, type AddAssignmentValues } from "./schemas";

export function useAddAssignmentForm(userId: string, onDone: () => void) {
  const add = useAddAssignment(userId);
  return useServerForm<AddAssignmentValues>({
    schema: addAssignmentSchema,
    defaultValues: { assignment: EMPTY_ASSIGNMENT },
    onSubmit: (values) => add.mutateAsync(toAssignmentInput(values.assignment)),
    onSuccess: onDone,
  });
}
