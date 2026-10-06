import { useMemo, useState } from "react";
import { errorMessage } from "@/lib/error-messages";
import { paginationFrom } from "@/lib/pagination";
import { useDialogState } from "@/lib/use-dialog-state";
import { useCancelMeeting, useMarkNoShow, useMeetings, type MeetingBox } from "./api";
import { meetingColumns } from "./meeting-columns";
import type { Meeting } from "./types";

/** Staff meetings table with cancel / no-show / complete. */
export function useMeetingsList(box: MeetingBox) {
  const [page, setPage] = useState(1);
  const query = useMeetings({ box, page, pageSize: 20 });
  const cancelDialog = useDialogState<Meeting>();
  const noShowDialog = useDialogState<Meeting>();
  const completeDialog = useDialogState<Meeting>();
  const cancel = useCancelMeeting();
  const noShow = useMarkNoShow();

  const { show: showCancel } = cancelDialog;
  const { show: showNoShow } = noShowDialog;
  const { show: showComplete } = completeDialog;
  const columns = useMemo(
    () => meetingColumns({ onCancel: showCancel, onNoShow: showNoShow, onComplete: showComplete }),
    [showCancel, showNoShow, showComplete],
  );

  return {
    query,
    rows: query.data?.data,
    columns,
    pagination: paginationFrom(query.data?.meta, setPage),
    cancelDialog,
    cancelling: cancel.isPending,
    cancelError: cancel.error ? errorMessage(cancel.error) : null,
    confirmCancel: (reason: string) => {
      if (!cancelDialog.item) return;
      cancel.mutate({ id: cancelDialog.item.id, reason: reason || undefined }, { onSuccess: cancelDialog.close });
    },
    noShowDialog,
    markingNoShow: noShow.isPending,
    confirmNoShow: () => noShowDialog.item && noShow.mutate(noShowDialog.item.id, { onSuccess: noShowDialog.close }),
    completeDialog,
  };
}
