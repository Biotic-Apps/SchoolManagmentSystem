import { useCan } from "@/features/auth/use-can";
import { useDialogState } from "@/lib/use-dialog-state";
import { useBookLists } from "./api";
import { draftAction, latestRevision } from "./options";
import { useReviewActions } from "./use-review-actions";

export interface SyllabusScope {
  branchId: string;
  sessionId: string | null;
  classId?: string;
}

export function useBookListsTab({ branchId, sessionId, classId }: SyllabusScope) {
  const can = useCan();
  const enabled = !!sessionId && !!classId;
  const query = useBookLists({ branchId, sessionId, classId }, enabled);
  const current = latestRevision(query.data);
  const review = useReviewActions("bookList", current);
  const editor = useDialogState<true>();
  const history = useDialogState<true>();
  const action = draftAction(current?.status);

  return {
    needsClass: !classId,
    needsSession: !sessionId,
    query,
    loading: enabled && query.isLoading,
    current,
    review,
    editAction: can("syllabus.edit") ? action : null,
    editor,
    history,
  };
}
