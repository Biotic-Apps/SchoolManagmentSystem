"use client";

import type { QueryKey } from "@tanstack/react-query";
import { InlineNotice } from "@/components/shared/InlineNotice";
import { ProgressBar } from "@/components/shared/ProgressBar";
import { useJobPoll } from "@/lib/use-job-poll";

interface JobProgressNoticeProps {
  jobId: string | null;
  /** What the job does, e.g. "Generating invoices". */
  label: string;
  doneLabel?: string;
  /** Lists refreshed when the job ends. */
  invalidate?: QueryKey[];
}

/** Status line for a background job started from this screen. */
export function JobProgressNotice({ jobId, label, doneLabel = "Done.", invalidate }: JobProgressNoticeProps) {
  const job = useJobPoll(jobId, invalidate);
  if (!jobId) return null;
  if (job.failed) {
    return <InlineNotice tone="error">{job.job?.error || `${label} failed. Try again.`}</InlineNotice>;
  }
  if (job.completed) return <InlineNotice>{doneLabel}</InlineNotice>;
  if (job.untracked) {
    return <InlineNotice>{label} in the background. The list refreshes when it is ready.</InlineNotice>;
  }
  return (
    <InlineNotice>
      <div className="flex flex-col gap-2">
        <span>{label}…</span>
        {typeof job.job?.progress === "number" && <ProgressBar percent={job.job.progress} label={label} />}
      </div>
    </InlineNotice>
  );
}
