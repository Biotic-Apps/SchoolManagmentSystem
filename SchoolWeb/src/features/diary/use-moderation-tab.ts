import { useBranchPicker } from "@/features/branches/use-branch-picker";
import { useDialogState } from "@/lib/use-dialog-state";
import { useApproveDiary, useDiaryEntries, useReturnDiary } from "./api";
import { notifyPublishResult, toastDiaryError } from "./options";
import type { DiaryEntry } from "./types";

/** diary.approve: SUBMITTED entries waiting for moderation in a branch. */
export function useModerationTab() {
  const picker = useBranchPicker();
  const query = useDiaryEntries({ status: "SUBMITTED", branchId: picker.branchId }, !!picker.branchId);
  const approve = useApproveDiary();
  const returnEntry = useReturnDiary();
  const returning = useDialogState<DiaryEntry>();

  return {
    picker,
    query,
    rows: (query.data ?? []).filter((entry) => entry.status === "SUBMITTED"),
    publishingId: approve.isPending ? approve.variables?.id : undefined,
    approve: (entry: DiaryEntry) =>
      approve.mutate(entry, { onSuccess: notifyPublishResult, onError: toastDiaryError }),
    returning,
    returnPending: returnEntry.isPending,
    confirmReturn: (comment: string) => {
      if (!returning.item) return;
      returnEntry.mutate({ id: returning.item.id, comment }, { onSuccess: returning.close });
    },
  };
}
