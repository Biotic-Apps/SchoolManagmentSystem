import { useActiveChild } from "@/features/auth/use-active-child";
import { errorMessage } from "@/lib/error-messages";
import { useDialogState } from "@/lib/use-dialog-state";
import { useCancelMeeting, useMeetings, type MeetingBox } from "./api";
import type { Meeting } from "./types";

/** The active child's meetings; upcoming ones can be cancelled by the parent. */
export function useParentMeetings(box: MeetingBox) {
  const child = useActiveChild();
  const query = useMeetings({ box, studentId: child?.id, pageSize: 50 }, !!child);
  const cancelDialog = useDialogState<Meeting>();
  const cancel = useCancelMeeting();

  return {
    query,
    meetings: query.data?.data ?? [],
    cancelDialog,
    cancelling: cancel.isPending,
    cancelError: cancel.error ? errorMessage(cancel.error) : null,
    confirmCancel: (reason: string) => {
      if (!cancelDialog.item) return;
      cancel.mutate({ id: cancelDialog.item.id, reason: reason || undefined }, { onSuccess: cancelDialog.close });
    },
  };
}
