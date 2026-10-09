"use client";

import { InlineNotice } from "@/components/shared/InlineNotice";
import { ProgressBar } from "@/components/shared/ProgressBar";
import { DownloadButton } from "@/components/shared/DownloadButton";
import { useJobPoll } from "@/lib/use-job-poll";

interface PdfJobStatusProps {
  jobId: string | null;
  /** e.g. "Preparing report cards". */
  label: string;
  /** Download button text, e.g. "Download report cards". */
  downloadLabel: string;
  /** Count noun for the done line, e.g. "card" → "12 cards ready". */
  unit?: string;
}

/** Progress of a background PDF job, then its download button. */
export function PdfJobStatus({ jobId, label, downloadLabel, unit }: PdfJobStatusProps) {
  const poll = useJobPoll(jobId);
  if (!jobId) return null;
  if (poll.failed) {
    return <InlineNotice tone="error">{poll.job?.error || `${label} failed. Try again.`}</InlineNotice>;
  }
  if (poll.completed) {
    const count = poll.job?.result?.count;
    const summary = unit && typeof count === "number" ? `${count} ${unit}${count === 1 ? "" : "s"} ready.` : "Ready.";
    return (
      <div className="flex flex-wrap items-center gap-3" role="status">
        <DownloadButton url={poll.job?.result?.fileUrl} label={downloadLabel} variant="primary" />
        <span className="text-caption text-fg-muted">{summary}</span>
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-2" role="status">
      <span className="text-caption text-fg-muted">{label}…</span>
      <ProgressBar percent={poll.job?.progress ?? 5} label={label} />
    </div>
  );
}
