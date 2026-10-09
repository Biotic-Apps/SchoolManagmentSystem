import { useServerForm } from "@/lib/use-server-form";
import { useAddOvertime } from "./overtime-api";
import { overtimeSchema, toOvertimeInput } from "./schemas";

export function useOvertimeForm(date: string, onDone: () => void) {
  const add = useAddOvertime();
  return useServerForm({
    schema: overtimeSchema,
    defaultValues: { staffId: "", date, hours: "", reason: "" },
    onSubmit: (values) => add.mutateAsync(toOvertimeInput(values)),
    onSuccess: onDone,
  });
}
