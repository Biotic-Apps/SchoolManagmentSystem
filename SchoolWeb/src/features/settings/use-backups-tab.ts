import { useMemo, useState } from "react";
import { errorMessage } from "@/lib/error-messages";
import { isHttpUrl } from "@/lib/safe-url";
import { toast } from "@/lib/toast";
import { useDialogState } from "@/lib/use-dialog-state";
import { backupColumns } from "./backup-columns";
import type { BackupRun } from "./backup-types";
import { fetchBackupDownloadUrl, useBackups, useRunBackup, useVerifyBackup } from "./backups-api";

/** Opens a tab synchronously (popup blockers) and points it at the signed URL once it arrives. */
async function openSignedDownload(id: string) {
  const tab = window.open("about:blank", "_blank");
  if (tab) tab.opener = null;
  try {
    const url = await fetchBackupDownloadUrl(id);
    if (!url || !isHttpUrl(url)) throw new Error("The backup file is not available.");
    if (tab) tab.location.href = url;
    else window.open(url, "_blank", "noopener,noreferrer");
  } catch (error) {
    tab?.close();
    toast.error(errorMessage(error));
  }
}

export function useBackupsTab() {
  const query = useBackups();
  const runBackup = useRunBackup();
  const verify = useVerifyBackup();
  const confirmRun = useDialogState<true>();
  const checks = useDialogState<BackupRun>();
  const [runJobId, setRunJobId] = useState<string | null>(null);
  const [verifyJobId, setVerifyJobId] = useState<string | null>(null);

  const columns = useMemo(
    () =>
      backupColumns({
        onVerify: (run) => verify.mutate(run.id, { onSuccess: (data) => setVerifyJobId(data.jobId) }),
        onDownload: (run) => void openSignedDownload(run.id),
        onViewChecks: checks.show,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mutate and show are stable
    [],
  );

  const startBackup = () =>
    runBackup.mutate(undefined, {
      onSuccess: (data) => {
        setRunJobId(data.jobId);
        confirmRun.close();
      },
    });

  const rows = query.data;
  return {
    query,
    rows,
    columns,
    confirmRun,
    startBackup,
    starting: runBackup.isPending,
    backupRunning: !!rows?.some((run) => run.status === "RUNNING"),
    runJobId,
    verifyJobId,
    checks,
  };
}

export type BackupsTabState = ReturnType<typeof useBackupsTab>;
