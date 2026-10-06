"use client";

import { RotateCw } from "lucide-react";
import { DetailDrawer } from "@/components/shared/DetailDrawer";
import { DetailList } from "@/components/shared/DetailList";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/Button";
import { formatDateTime, formatNumber, humanize } from "@/lib/format";
import type { SupportJobsState } from "../../use-support-jobs";

export function JobDetailDrawer({ section }: { section: SupportJobsState }) {
  const { detail } = section;
  const job = detail.item;
  if (!job) return null;

  return (
    <DetailDrawer
      open={detail.open}
      onOpenChange={detail.onOpenChange}
      title={humanize(job.name)}
      description={`${humanize(job.queue)} queue`}
      actions={
        section.canEdit &&
        job.status === "FAILED" && (
          <Button size="sm" loading={section.retrying} onClick={() => section.retry(job.id)}>
            <RotateCw />
            Retry job
          </Button>
        )
      }
    >
      <DetailList
        items={[
          { label: "Status", value: <StatusBadge status={job.status} /> },
          { label: "Attempts", value: formatNumber(job.attempts) },
          { label: "Started", value: formatDateTime(job.startedAt ?? job.createdAt) },
          { label: "Finished", value: formatDateTime(job.finishedAt) },
          { label: "Job ID", value: <span className="font-mono text-caption">{job.id}</span> },
        ]}
      />
      <div className="flex flex-col gap-2">
        <span className="text-caption text-fg-muted">Error</span>
        <pre className="max-h-96 overflow-auto whitespace-pre-wrap break-words rounded-input border border-border bg-background p-3 font-mono text-caption text-fg">
          {job.error || "No error recorded."}
        </pre>
      </div>
    </DetailDrawer>
  );
}
