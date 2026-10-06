import { useCan } from "@/features/auth/use-can";
import { useAcademicScope } from "@/features/classes/use-academic-scope";
import { paginationFrom } from "@/lib/pagination";
import { notifyActionResult } from "@/lib/probation";
import { useDialogState } from "@/lib/use-dialog-state";
import { useListState } from "@/lib/use-list-state";
import { useNotices, usePublishNotice } from "./api";
import type { Notice } from "./types";

/** Management list (notices.add): branch-scoped, filtered by status. */
export function useNoticesPage() {
  const can = useCan();
  const scope = useAcademicScope();
  const list = useListState<{ status?: string }>({ status: undefined });
  const query = useNotices({ ...list.params, branchId: scope.branchId }, !!scope.branchId);
  const composer = useDialogState<Notice>();
  const reads = useDialogState<Notice>();
  const preview = useDialogState<Notice>();
  const publish = usePublishNotice();

  return {
    scope,
    list,
    query,
    rows: query.data?.data,
    pagination: paginationFrom(query.data?.meta, list.setPage),
    composer,
    reads,
    preview,
    /** Drafts open in the editor, everything else in the read-only drawer. */
    open: (notice: Notice) => (notice.status === "DRAFT" ? composer.show(notice) : preview.show(notice)),
    canPublish: can("notices.publish") || can("notices.add"),
    publishingId: publish.isPending ? publish.variables : undefined,
    publish: (notice: Notice) =>
      publish.mutate(notice.id, { onSuccess: (result) => notifyActionResult(result, "Notice published") }),
  };
}

export type NoticesPageState = ReturnType<typeof useNoticesPage>;
