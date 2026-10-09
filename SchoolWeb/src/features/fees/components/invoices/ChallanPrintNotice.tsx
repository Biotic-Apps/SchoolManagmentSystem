"use client";

import { DownloadButton } from "@/components/shared/DownloadButton";
import { InlineNotice } from "@/components/shared/InlineNotice";
import { ProgressBar } from "@/components/shared/ProgressBar";
import { useJobPoll } from "@/lib/use-job-poll";
import type { PrintChallansJob } from "../../challan-print";

/** Progress of a bulk challan print, then the PDF download. */
export function ChallanPrintNotice({ job }: { job: PrintChallansJob | null }) {
  const poll = useJobPoll(job?.jobId ?? null);
  if (!job) return null;
  const pages = `${job.count} ${job.count === 1 ? "challan" : "challans"}`;
  if (poll.failed) {
    return <InlineNotice tone="error">{poll.job?.error || "Preparing the challans failed. Try again."}</InlineNotice>;
  }
  if (poll.completed) {
    return (
      <InlineNotice>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span>{pages} ready to print (3 copies on each page).</span>
          <DownloadButton url={poll.job?.result?.fileUrl} label="Download challans" variant="primary" size="sm" />
        </div>
      </InlineNotice>
    );
  }
  return (
    <InlineNotice>
      <div className="flex flex-col gap-2">
        <span>Preparing {pages}…</span>
        {typeof poll.job?.progress === "number" && (
          <ProgressBar percent={poll.job.progress} label="Preparing challans" />
        )}
      </div>
    </InlineNotice>
  );
}
