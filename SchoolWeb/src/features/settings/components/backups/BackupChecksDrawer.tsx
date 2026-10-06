"use client";

import { useMemo } from "react";
import { DataTable } from "@/components/shared/DataTable";
import { DetailDrawer } from "@/components/shared/DetailDrawer";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { formatDateTime } from "@/lib/format";
import { backupCheckColumns } from "../../backup-check-columns";
import type { BackupsTabState } from "../../use-backups-tab";

export function BackupChecksDrawer({ checks }: { checks: BackupsTabState["checks"] }) {
  const columns = useMemo(() => backupCheckColumns(), []);
  const run = checks.item;
  if (!run) return null;
  const verify = run.verify;

  return (
    <DetailDrawer
      open={checks.open}
      onOpenChange={checks.onOpenChange}
      title="Restore check"
      description={`Backup started ${formatDateTime(run.startedAt)}`}
    >
      <div className="flex flex-wrap items-center gap-2 text-label text-fg-muted">
        <StatusBadge status={verify?.status ?? "NOT_RUN"} />
        {verify?.at && <span>Checked {formatDateTime(verify.at)}</span>}
      </div>
      <DataTable
        columns={columns}
        rows={verify?.checks}
        getRowId={(row) => row.name}
        emptyTitle="No checks recorded"
        emptyDescription="Run a restore check to compare this backup against the live database."
      />
    </DetailDrawer>
  );
}
