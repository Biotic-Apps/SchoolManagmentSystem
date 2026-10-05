"use client";

import { ErrorState } from "@/components/shared/ErrorState";
import { Skeleton } from "@/components/ui/Skeleton";
import { usePermissionMatrix } from "../use-permission-matrix";
import { usePermissionSelection } from "../use-permission-selection";
import { PermissionGrid } from "./PermissionGrid";
import { SpecialPermissionList } from "./SpecialPermissionList";

/** Module × action permission editor bound to the surrounding role form. */
export function PermissionMatrix({ readOnly }: { readOnly: boolean }) {
  const { matrix, total, query } = usePermissionMatrix();
  const selection = usePermissionSelection(matrix.rows);

  if (query.isLoading) return <Skeleton className="h-64 w-full" />;
  if (query.error) return <ErrorState error={query.error} onRetry={() => query.refetch()} />;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <span className="text-label font-medium text-fg">Permissions</span>
        <span className="text-caption text-fg-muted">
          {selection.count} of {total} selected
        </span>
      </div>
      <PermissionGrid rows={matrix.rows} selection={selection} readOnly={readOnly} />
      <SpecialPermissionList permissions={matrix.specials} selection={selection} readOnly={readOnly} />
      {selection.error && (
        <p role="alert" className="text-caption text-error">
          {selection.error}
        </p>
      )}
    </div>
  );
}
