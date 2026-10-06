import { ProgressBar } from "@/components/shared/ProgressBar";
import { Card, CardContent } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { percentTone } from "../options";
import type { AttendanceCounts } from "../types";
import { AttendanceCountsBar } from "./AttendanceCountsBar";

interface AttendanceSummaryCardProps {
  counts: AttendanceCounts;
  caption: string;
  loading?: boolean;
}

/** Attendance percentage with the per-status totals behind it. */
export function AttendanceSummaryCard({ counts, caption, loading }: AttendanceSummaryCardProps) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-4 md:flex-row md:items-center md:gap-8">
        <div className="flex min-w-56 flex-col gap-2">
          <span className="text-label text-fg-muted">{caption}</span>
          {loading ? (
            <Skeleton className="h-8 w-24" />
          ) : (
            <span className="text-page-title font-semibold tabular-nums text-fg">{counts.percent}%</span>
          )}
          <ProgressBar percent={counts.percent} tone={percentTone(counts.percent)} label="Attendance" />
        </div>
        <AttendanceCountsBar counts={counts} />
      </CardContent>
    </Card>
  );
}
