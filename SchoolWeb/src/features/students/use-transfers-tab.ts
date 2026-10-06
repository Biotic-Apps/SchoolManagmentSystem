import { useMemo } from "react";
import { useCan } from "@/features/auth/use-can";
import { errorMessage } from "@/lib/error-messages";
import { paginationFrom } from "@/lib/pagination";
import { useDialogState } from "@/lib/use-dialog-state";
import { useListState } from "@/lib/use-list-state";
import { transferColumns } from "./transfer-columns";
import { useCloseTransfer, useTransfers } from "./transfers-api";
import type { Transfer } from "./types";

type CloseAction = "reject" | "cancel";

export function useTransfersTab(branchId: string) {
  const can = useCan();
  const list = useListState<{ direction?: string; status?: string }>({ direction: "IN", status: undefined });
  const query = useTransfers({ ...list.params, branchId });
  const accept = useDialogState<Transfer>();
  const closing = useDialogState<{ transfer: Transfer; action: CloseAction }>();
  const close = useCloseTransfer();
  const canEdit = can("students.edit");

  const { show: showClose, item: closeItem } = closing;
  const { reset: resetClose } = close;
  const columns = useMemo(() => {
    const open = (action: CloseAction) => (transfer: Transfer) => {
      resetClose();
      showClose({ transfer, action });
    };
    return transferColumns({
      branchId,
      onAccept: canEdit ? accept.show : undefined,
      onReject: canEdit ? open("reject") : undefined,
      onCancel: canEdit ? open("cancel") : undefined,
    });
  }, [branchId, canEdit, accept.show, showClose, resetClose]);

  const confirmClose = (reason: string) => {
    if (!closeItem) return;
    close.mutate({ id: closeItem.transfer.id, action: closeItem.action, reason }, { onSuccess: closing.close });
  };

  return {
    list,
    query,
    rows: query.data?.data,
    pagination: paginationFrom(query.data?.meta, list.setPage),
    columns,
    accept,
    closing,
    confirmClose,
    closeSubmitting: close.isPending,
    closeError: close.error ? errorMessage(close.error) : null,
  };
}
