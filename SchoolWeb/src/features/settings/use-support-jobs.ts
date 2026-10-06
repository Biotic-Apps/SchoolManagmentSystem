import { useMemo } from "react";
import { paginationFrom } from "@/lib/pagination";
import { useDialogState } from "@/lib/use-dialog-state";
import { useListState } from "@/lib/use-list-state";
import { failedJobColumns } from "./failed-job-columns";
import { useRetryJob, useSupportJobs } from "./support-api";
import type { JobRun, SupportJobFilters } from "./support-types";

export function useSupportJobsSection(canEdit: boolean) {
  const list = useListState<SupportJobFilters>({ status: "FAILED" });
  const query = useSupportJobs(list.params);
  const retry = useRetryJob();
  const detail = useDialogState<JobRun>();
  const retryingId = retry.isPending ? retry.variables : undefined;

  const columns = useMemo(
    () => failedJobColumns({ canEdit, onRetry: (id) => retry.mutate(id), retryingId }),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mutate is stable
    [canEdit, retryingId],
  );

  return {
    list,
    query,
    rows: query.data?.rows,
    columns,
    pagination: paginationFrom(query.data?.meta, list.setPage),
    detail,
    retry: (id: string) => retry.mutate(id, { onSuccess: () => detail.close() }),
    retrying: retry.isPending,
    canEdit,
  };
}

export type SupportJobsState = ReturnType<typeof useSupportJobsSection>;
