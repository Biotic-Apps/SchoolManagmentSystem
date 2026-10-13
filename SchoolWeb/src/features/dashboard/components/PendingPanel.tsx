"use client";

import { ErrorState } from "@/components/shared/ErrorState";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { Card } from "@/components/ui/Card";
import { usePendingPanel } from "../use-pending-panel";
import { PendingTile } from "./PendingTile";

export function PendingPanel({ branchId }: { branchId: string | null }) {
  const { query, tiles } = usePendingPanel(branchId);
  if (tiles.length === 0) return null;

  return (
    <section aria-labelledby="pending-today" className="flex flex-col gap-3">
      <SectionHeading id="pending-today" level={2} title="Today" description="Work waiting on someone right now." />
      {query.error ? (
        <Card>
          <ErrorState error={query.error} onRetry={() => query.refetch()} />
        </Card>
      ) : (
        <div className="stagger grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
          {tiles.map((tile) => (
            <PendingTile key={tile.key} tile={tile} loading={query.isLoading} />
          ))}
        </div>
      )}
    </section>
  );
}
