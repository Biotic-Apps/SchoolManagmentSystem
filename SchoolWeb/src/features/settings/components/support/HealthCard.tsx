"use client";

import { RefreshCw } from "lucide-react";
import { ErrorState } from "@/components/shared/ErrorState";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { healthTiles } from "../../health-tiles";
import { useSystemHealth } from "../../support-api";
import { HealthTile } from "./HealthTile";

const GRID = "grid gap-3 sm:grid-cols-2 lg:grid-cols-3";

export function HealthCard() {
  const query = useSystemHealth(true);

  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <CardTitle>System health</CardTitle>
          <CardDescription>Database, background jobs, file storage and backups at a glance.</CardDescription>
        </div>
        <Button variant="secondary" size="sm" onClick={() => query.refetch()} loading={query.isFetching}>
          <RefreshCw />
          Refresh
        </Button>
      </CardHeader>
      <CardContent>
        {query.isLoading ? (
          <div className={GRID}>
            {Array.from({ length: 6 }, (_, index) => (
              <Skeleton key={index} className="h-20 w-full" />
            ))}
          </div>
        ) : query.error || !query.data ? (
          <ErrorState error={query.error} onRetry={() => query.refetch()} />
        ) : (
          <div className={GRID}>
            {healthTiles(query.data).map(({ id, ...tile }) => (
              <HealthTile key={id} {...tile} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
