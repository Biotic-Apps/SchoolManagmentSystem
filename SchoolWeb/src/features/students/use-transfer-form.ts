import { useActiveBranches } from "@/features/branches/api";
import { useServerForm } from "@/lib/use-server-form";
import { transferDefaults, transferSchema, type TransferValues } from "./action-schemas";
import { useRequestTransfer } from "./api";
import type { StudentDetail } from "./types";

/** Requests a transfer to another branch; the destination places the student. */
export function useTransferForm(student: StudentDetail, onDone: () => void) {
  const request = useRequestTransfer(student.id);
  const { branches, isLoading } = useActiveBranches();
  const currentBranchId = student.enrollment?.branchId;
  const server = useServerForm<TransferValues>({
    schema: transferSchema,
    defaultValues: transferDefaults(),
    onSubmit: (values) => request.mutateAsync({ ...values, reason: values.reason.trim() }),
    onSuccess: onDone,
  });
  const branchOptions = branches
    .filter((branch) => branch.id !== currentBranchId)
    .map((branch) => ({ id: branch.id, name: branch.name }));
  return { ...server, branchOptions, loadingBranches: isLoading };
}
