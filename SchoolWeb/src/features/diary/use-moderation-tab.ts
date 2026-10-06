import { useBranchPicker } from "@/features/branches/use-branch-picker";
import { useDialogState } from "@/lib/use-dialog-state";
import { useDiaryEntries, usePublishDiary, useReturnDiary } from "./api";
import { notifyPublishResult, toastDiaryError } from "./options";
import type { DiaryEntry } from "./types";

/** diary.approve: SUBMITTED entries waiting for moderation in a branch. */
export function useModerationTab() {
  const picker = useBranchPicker();
  const query = useDiaryEntries({ status: "SUBMITTED", branchId: picker.branchId }, !!picker.branchId);
  const publish = usePublishDiary();
  const returnEntry = useReturnDiary();
  const returning = useDialogState<DiaryEntry>();

  return {
    picker,
    query,
    rows: (query.data ?? []).filter((entry) => entry.status === "SUBMITTED"),
    publishingId: publish.isPending ? publish.variables : undefined,
    approve: (entry: DiaryEntry) =>
      publish.mutate(entry.id, { onSuccess: notifyPublishResult, onError: toastDiaryError }),
    returning,
    returnPending: returnEntry.isPending,
    confirmReturn: (comment: string) => {
      if (!returning.item) return;
      returnEntry.mutate({ id: returning.item.id, comment }, { onSuccess: returning.close });
    },
  };
}
