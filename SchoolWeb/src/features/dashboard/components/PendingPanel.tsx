"use client";

import { ErrorState } from "@/components/shared/ErrorState";
import { Card } from "@/components/ui/Card";
import { usePendingPanel } from "../use-pending-panel";
import { PendingTile } from "./PendingTile";

export function PendingPanel({ branchId }: { branchId: string | null }) {
  const { query, tiles } = usePendingPanel(branchId);
  if (tiles.length === 0) return null;

  return (
    <section aria-labelledby="pending-today" className="flex flex-col gap-3">
      <h2 id="pending-today" className="text-card-title font-semibold text-fg">
        Today
      </h2>
      {query.error ? (
        <Card>
          <ErrorState error={query.error} onRetry={() => query.refetch()} />
        </Card>
      ) : (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
          {tiles.map((tile) => (
            <PendingTile key={tile.key} tile={tile} loading={query.isLoading} />
          ))}
        </div>
      )}
    </section>
  );
}
