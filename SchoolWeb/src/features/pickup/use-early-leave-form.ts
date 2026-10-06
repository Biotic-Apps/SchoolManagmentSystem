import { useServerForm } from "@/lib/use-server-form";
import { useCreateEarlyLeave } from "./api";
import { earlyLeaveDefaults, earlyLeaveSchema, toEarlyLeaveInput, type EarlyLeaveValues } from "./schemas";

/** Staff-initiated (student picked in the form) or parent request (studentId = the active child). */
export function useEarlyLeaveForm({ studentId = "", date, onDone }: { studentId?: string; date: string; onDone: () => void }) {
  const create = useCreateEarlyLeave();
  return useServerForm<EarlyLeaveValues>({
    schema: earlyLeaveSchema,
    defaultValues: earlyLeaveDefaults(studentId, date),
    onSubmit: (values) => create.mutateAsync(toEarlyLeaveInput(values)),
    onSuccess: onDone,
  });
}
