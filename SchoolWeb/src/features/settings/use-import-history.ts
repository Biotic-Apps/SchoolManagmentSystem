import { ApiError } from "@/lib/api-error";
import { errorMessage } from "@/lib/error-messages";
import { toast } from "@/lib/toast";
import { useDialogState } from "@/lib/use-dialog-state";
import { useImportHistory, useRevertImport } from "./imports-api";
import type { ImportSummary } from "./import-types";

const IN_USE_MESSAGE = "This import can't be reverted: its records are already in use.";

function revertMessage(error: unknown): string {
  if (error instanceof ApiError && error.status === 409) return error.message || IN_USE_MESSAGE;
  return errorMessage(error);
}

export function useImportHistoryList(branchId: string | null) {
  const query = useImportHistory(branchId);
  const revert = useRevertImport();
  const revertDialog = useDialogState<ImportSummary>();

  const confirmRevert = () => {
    const item = revertDialog.item;
    if (!item) return;
    revert.mutate(item.id, {
      onSuccess: () => revertDialog.close(),
      onError: (error) => {
        revertDialog.close();
        toast.error(revertMessage(error));
      },
    });
  };

  return {
    rows: query.data,
    loading: query.isLoading,
    error: query.error,
    retry: () => void query.refetch(),
    revertDialog,
    confirmRevert,
    reverting: revert.isPending,
  };
}
