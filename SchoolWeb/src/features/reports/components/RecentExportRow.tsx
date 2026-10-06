"use client";

import { DownloadButton } from "@/components/shared/DownloadButton";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Spinner } from "@/components/ui/Spinner";
import { formatDateTime } from "@/lib/format";
import type { RecentExport } from "../types";
import { useReportJob } from "../use-report-job";

export function RecentExportRow({ item }: { item: RecentExport }) {
  const job = useReportJob(item.jobId);

  return (
    <li className="flex flex-col gap-3 py-3 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 flex-col gap-1">
        <span className="text-label font-medium text-fg">{item.name}</span>
        <span className="text-caption text-fg-muted">
          {item.format} · {formatDateTime(item.startedAt)}
        </span>
        {job.failed && job.errorText && <span className="text-caption text-error">{job.errorText}</span>}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {job.running && <Spinner className="size-4 text-fg-muted" />}
        <StatusBadge status={job.status} />
        {!job.failed && <DownloadButton url={job.fileUrl} size="sm" />}
      </div>
    </li>
  );
}
