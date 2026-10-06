"use client";

import { ErrorState } from "@/components/shared/ErrorState";
import { ProgressBar } from "@/components/shared/ProgressBar";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/Dialog";
import { Skeleton } from "@/components/ui/Skeleton";
import { formatNumber } from "@/lib/format";
import { useNoticeReads } from "../api";
import type { Notice } from "../types";

interface NoticeReadsDialogProps {
  notice: Notice | null;
  onOpenChange: (open: boolean) => void;
}

export function NoticeReadsDialog({ notice, onOpenChange }: NoticeReadsDialogProps) {
  const query = useNoticeReads(notice?.id ?? null);
  const reads = query.data;
  const percent = reads && reads.total > 0 ? Math.round((reads.read / reads.total) * 100) : 0;

  return (
    <Dialog open={!!notice} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Read receipts</DialogTitle>
          {notice && <DialogDescription className="truncate">{notice.title}</DialogDescription>}
        </DialogHeader>
        {query.isLoading && <Skeleton className="h-16 w-full" />}
        {!!query.error && <ErrorState error={query.error} onRetry={() => query.refetch()} />}
        {reads && (
          <div className="flex flex-col gap-3">
            <p className="text-body text-fg">
              <span className="font-semibold">{formatNumber(reads.read)}</span> of{" "}
              <span className="font-semibold">{formatNumber(reads.total)}</span> recipients have read it.
            </p>
            <ProgressBar percent={percent} label="Read" tone={percent >= 75 ? "success" : percent >= 40 ? "warning" : "error"} />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
