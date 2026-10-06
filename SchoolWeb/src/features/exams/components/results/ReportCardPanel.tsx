"use client";

import { DownloadButton } from "@/components/shared/DownloadButton";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Skeleton } from "@/components/ui/Skeleton";
import { Spinner } from "@/components/ui/Spinner";
import { formatDateTime } from "@/lib/format";
import { useReportCardPanel } from "../../use-report-card-panel";

interface ReportCardPanelProps {
  studentId: string | null;
  examId: string | null;
  /** Compact: only the download button and a short status line. */
  compact?: boolean;
}

export function ReportCardPanel({ studentId, examId, compact }: ReportCardPanelProps) {
  const panel = useReportCardPanel(studentId, examId);
  const { card, query } = panel;

  if (query.isLoading) return <Skeleton className="h-10 w-40" />;

  const status = !card
    ? "Report card not generated yet."
    : panel.pending
      ? "Report card is being generated…"
      : panel.failed
        ? "The report card could not be generated."
        : `Generated ${formatDateTime(card.generatedAt)}`;

  return (
    <div className="flex flex-col gap-2">
      {!compact && card && (
        <div className="flex items-center gap-2">
          <span className="text-label text-fg-muted">Report card</span>
          <StatusBadge status={card.status} />
        </div>
      )}
      <div className="flex flex-wrap items-center gap-3">
        <DownloadButton url={panel.fileUrl} label="Report card" size={compact ? "sm" : "md"} />
        <span className="flex items-center gap-2 text-caption text-fg-muted" role="status">
          {panel.pending && <Spinner />}
          {status}
        </span>
      </div>
    </div>
  );
}
