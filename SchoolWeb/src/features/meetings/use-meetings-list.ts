import { useMemo, useState } from "react";
import { errorMessage } from "@/lib/error-messages";
import { paginationFrom } from "@/lib/pagination";
import { useDialogState } from "@/lib/use-dialog-state";
import { useCancelMeeting, useDeclineMeeting, useMarkNoShow, useMeetings, type MeetingBox } from "./api";
import { meetingColumns } from "./meeting-columns";
import type { Meeting } from "./types";

/** Staff meetings table with cancel / no-show / complete, and accept / decline for parent requests. */
export function useMeetingsList(box: MeetingBox) {
  const [page, setPage] = useState(1);
  const query = useMeetings({ box, page, pageSize: 20 });
  const cancelDialog = useDialogState<Meeting>();
  const noShowDialog = useDialogState<Meeting>();
  const completeDialog = useDialogState<Meeting>();
  const acceptDialog = useDialogState<Meeting>();
  const declineDialog = useDialogState<Meeting>();
  const cancel = useCancelMeeting();
  const decline = useDeclineMeeting();
  const noShow = useMarkNoShow();

  const { show: showCancel } = cancelDialog;
  const { show: showNoShow } = noShowDialog;
  const { show: showComplete } = completeDialog;
  const { show: showAccept } = acceptDialog;
  const { show: showDecline } = declineDialog;
  const columns = useMemo(
    () =>
      meetingColumns({
        onCancel: showCancel,
        onNoShow: showNoShow,
        onComplete: showComplete,
        onAccept: showAccept,
        onDecline: showDecline,
      }),
    [showCancel, showNoShow, showComplete, showAccept, showDecline],
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
    acceptDialog,
    declineDialog,
    declining: decline.isPending,
    declineError: decline.error ? errorMessage(decline.error) : null,
    confirmDecline: (reason: string) => {
      if (!declineDialog.item) return;
      decline.mutate({ id: declineDialog.item.id, reason: reason || undefined }, { onSuccess: declineDialog.close });
    },
  };
}
