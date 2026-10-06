import { useQuery, useQueryClient, type QueryKey } from "@tanstack/react-query";
import { useEffect } from "react";
import { hasErrorCode } from "./api-error";
import { http } from "./http";

export type JobState = "QUEUED" | "RUNNING" | "DONE" | "COMPLETED" | "FAILED";

export interface JobStatus {
  id: string;
  status: JobState;
  /** 0–100 when the job reports it. */
  progress?: number | null;
  error?: string | null;
  result?: ({ fileUrl?: string | null; count?: number } & Record<string, unknown>) | null;
}

const FINISHED: JobState[] = ["DONE", "COMPLETED", "FAILED"];
const SUCCEEDED: JobState[] = ["DONE", "COMPLETED"];

/**
 * Polls GET /jobs/:id for a background job started by the API ({ jobId }).
 * When the API has no job endpoint (404) the job is treated as running in the background and
 * the given lists simply refresh a few times.
 */
export function useJobPoll(jobId: string | null, invalidate: QueryKey[] = []) {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ["jobs", jobId],
    queryFn: async () => {
      try {
        return (await http.get<JobStatus>(`/jobs/${jobId}`)).data;
      } catch (error) {
        if (hasErrorCode(error, "NOT_FOUND")) return null;
        throw error;
      }
    },
    enabled: !!jobId,
    retry: false,
    refetchInterval: (state) => {
      const data = state.state.data;
      if (data === null) return false;
      return data && FINISHED.includes(data.status) ? false : 2000;
    },
  });

  const job = query.data ?? null;
  const finished = !!job && FINISHED.includes(job.status);
  const untracked = !!jobId && query.data === null;

  useEffect(() => {
    if (!finished && !untracked) return;
    invalidate.forEach((queryKey) => queryClient.invalidateQueries({ queryKey }));
    // Untracked jobs: refresh again shortly after, while the worker catches up.
    if (!untracked) return;
    const timer = window.setTimeout(
      () => invalidate.forEach((queryKey) => queryClient.invalidateQueries({ queryKey })),
      5000,
    );
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once per state change
  }, [finished, untracked, queryClient]);

  return {
    job,
    running: !!jobId && !finished && !untracked && !query.error,
    completed: !!job && SUCCEEDED.includes(job.status),
    failed: job?.status === "FAILED" || !!query.error,
    untracked,
  };
}
