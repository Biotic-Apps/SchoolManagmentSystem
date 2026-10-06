"use client";

import { DatabaseBackup } from "lucide-react";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { DataTable } from "@/components/shared/DataTable";
import { JobProgressNotice } from "@/components/shared/JobProgressNotice";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { Button } from "@/components/ui/Button";
import { settingsKeys } from "../../keys";
import { useBackupsTab } from "../../use-backups-tab";
import { BackupChecksDrawer } from "./BackupChecksDrawer";

const REFRESH = [settingsKeys.backups];

export function BackupsTab() {
  const tab = useBackupsTab();
  const { query } = tab;

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <SectionHeading
          title="Backups"
          actions={
            <Button size="sm" onClick={() => tab.confirmRun.show(true)} disabled={tab.backupRunning}>
              <DatabaseBackup />
              Run backup
            </Button>
          }
        />
        <p className="text-caption text-fg-muted">
          Nightly backups are kept 30 days, plus one per month for 12 months. The latest backup is restore-checked weekly.
        </p>
      </div>
      <JobProgressNotice jobId={tab.runJobId} label="Backing up the database" doneLabel="Backup finished." invalidate={REFRESH} />
      <JobProgressNotice
        jobId={tab.verifyJobId}
        label="Verifying backup (restoring into a scratch database)"
        doneLabel="Restore check finished. Open the backup's checks for details."
        invalidate={REFRESH}
      />
      <DataTable
        columns={tab.columns}
        rows={tab.rows}
        getRowId={(row) => row.id}
        loading={query.isLoading}
        error={query.error}
        onRetry={() => query.refetch()}
        emptyTitle="No backups yet"
        emptyDescription="The first nightly backup appears here, or run one now."
      />
      <ConfirmDialog
        open={tab.confirmRun.open}
        onOpenChange={tab.confirmRun.onOpenChange}
        title="Run a backup now?"
        description="A full encrypted copy of the database is taken in the background. The app stays available while it runs."
        confirmLabel="Run backup"
        loading={tab.starting}
        onConfirm={tab.startBackup}
      />
      <BackupChecksDrawer checks={tab.checks} />
    </section>
  );
}
