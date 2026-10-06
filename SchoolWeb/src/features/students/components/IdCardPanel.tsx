"use client";

import { Download, IdCard, RefreshCw } from "lucide-react";
import { DetailList } from "@/components/shared/DetailList";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { InlineNotice } from "@/components/shared/InlineNotice";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { Spinner } from "@/components/ui/Spinner";
import { formatDateTime, formatNumber } from "@/lib/format";
import { useIdCardPanel } from "../use-id-card-panel";

export function IdCardPanel({ studentId, canGenerate }: { studentId: string; canGenerate: boolean }) {
  const panel = useIdCardPanel(studentId, canGenerate);
  const { card, query } = panel;

  if (query.isLoading) return <Skeleton className="h-32 w-full" />;
  if (query.error) return <ErrorState error={query.error} onRetry={() => query.refetch()} />;

  const generateButton = panel.canGenerate && (
    <Button variant={card ? "secondary" : "primary"} onClick={panel.generate}>
      <RefreshCw />
      {panel.failed ? "Try again" : panel.generateLabel}
    </Button>
  );

  if (!card) {
    return (
      <EmptyState
        icon={IdCard}
        title="No ID card yet"
        description={canGenerate ? "Generate a printable ID card for this student." : "The school has not issued an ID card yet."}
        action={generateButton}
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <DetailList
        items={[
          { label: "Status", value: <StatusBadge status={card.status} /> },
          { label: "Version", value: formatNumber(card.version) },
          { label: "Generated", value: formatDateTime(card.generatedAt) },
        ]}
      />
      {panel.pending && (
        <p role="status" className="flex items-center gap-2 text-label text-fg-muted">
          <Spinner />
          Rendering…
        </p>
      )}
      {panel.failed && <InlineNotice tone="error">The ID card could not be rendered.</InlineNotice>}
      <div className="flex flex-wrap gap-2">
        {panel.ready && card.fileUrl && (
          <Button asChild>
            <a href={card.fileUrl} target="_blank" rel="noopener noreferrer">
              <Download />
              Download
            </a>
          </Button>
        )}
        {generateButton}
      </div>
    </div>
  );
}
