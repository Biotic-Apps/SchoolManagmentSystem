import { useServerForm } from "@/lib/use-server-form";
import { useAddComplaintUpdate } from "./api";
import { complaintUpdateDefaults, complaintUpdateSchema, toComplaintUpdateInput } from "./schemas";

export function useComplaintUpdateForm(complaintId: string, onDone: () => void) {
  const add = useAddComplaintUpdate(complaintId);
  return useServerForm({
    schema: complaintUpdateSchema,
    defaultValues: complaintUpdateDefaults,
    onSubmit: (values) => add.mutateAsync(toComplaintUpdateInput(values)),
    onSuccess: onDone,
  });
}
