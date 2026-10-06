import { ProgressBar } from "@/components/shared/ProgressBar";
import { Card, CardContent } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { EMPTY_VALUE } from "@/lib/format";

interface CollectionRateCardProps {
  percent: number | null;
  loading?: boolean;
}

function toneFor(percent: number) {
  if (percent >= 80) return "success" as const;
  if (percent >= 50) return "warning" as const;
  return "error" as const;
}

export function CollectionRateCard({ percent, loading }: CollectionRateCardProps) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-3">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <span className="text-label text-fg-muted">Collection rate</span>
          {loading ? (
            <Skeleton className="h-6 w-16" />
          ) : (
            <span className="text-card-title font-semibold tabular-nums text-fg">
              {percent === null ? EMPTY_VALUE : `${Math.round(percent)}%`}
            </span>
          )}
        </div>
        {!loading && percent !== null && (
          <ProgressBar percent={percent} tone={toneFor(percent)} label="Collection rate" />
        )}
        <span className="text-caption text-fg-muted">Collected against billed for the month.</span>
      </CardContent>
    </Card>
  );
}
