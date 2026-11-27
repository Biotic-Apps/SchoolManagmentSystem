import { useReportJobStatus } from "./api";
import type { ReportJob } from "./types";

const POLL_MS = 2000;
/** The API reports QUEUED / RUNNING / DONE / FAILED (tasks/job-status.dto.ts); older names kept for safety. */
const DONE = new Set(["DONE", "READY", "COMPLETED", "FAILED"]);

const statusOf = (job: ReportJob | undefined) => job?.status?.toUpperCase() ?? "QUEUED";
const isDone = (job: ReportJob | undefined) => DONE.has(statusOf(job));

/** Polls one export every 2 s until it is ready or failed. */
export function useReportJob(jobId: string) {
  const query = useReportJobStatus(jobId, (job) => (isDone(job) ? false : POLL_MS));
  const job = query.data;
  const failed = statusOf(job) === "FAILED" || !!query.error;
  return {
    status: failed ? "FAILED" : statusOf(job),
    fileUrl: job?.fileUrl ?? null,
    running: !failed && !isDone(job),
    failed,
    errorText: job?.error ?? null,
  };
}
