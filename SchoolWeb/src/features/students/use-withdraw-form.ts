import { useServerForm } from "@/lib/use-server-form";
import { withdrawDefaults, withdrawSchema, type WithdrawValues } from "./action-schemas";
import { useWithdrawStudent } from "./api";
import type { StudentDetail } from "./types";

export function useWithdrawForm(student: StudentDetail, onDone: () => void) {
  const withdraw = useWithdrawStudent(student.id);
  return useServerForm<WithdrawValues>({
    schema: withdrawSchema,
    defaultValues: withdrawDefaults(),
    onSubmit: (values) => withdraw.mutateAsync({ ...values, reason: values.reason.trim() }),
    onSuccess: onDone,
  });
}
