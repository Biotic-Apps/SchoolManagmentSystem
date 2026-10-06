import { useQuery } from "@tanstack/react-query";
import { http } from "@/lib/http";
import { useApiMutation } from "@/lib/use-api-mutation";
import type { BackupRun } from "./backup-types";
import { settingsKeys } from "./keys";
import { normaliseList } from "./list-response";

const POLL_MS = 5000;

function isBusy(runs: BackupRun[] | undefined): boolean {
  return !!runs?.some((run) => run.status === "RUNNING" || run.verify?.status === "RUNNING");
}

export function useBackups() {
  return useQuery({
    queryKey: settingsKeys.backups,
    queryFn: async () => normaliseList(await http.get<BackupRun[]>("/backups")).rows,
    refetchInterval: (query) => (isBusy(query.state.data) ? POLL_MS : false),
  });
}

export function useRunBackup() {
  return useApiMutation({
    mutationFn: async () => (await http.post<{ jobId: string }>("/backups")).data,
    invalidate: [settingsKeys.backups],
    success: "Backup started",
  });
}

export function useVerifyBackup() {
  return useApiMutation({
    mutationFn: async (id: string) => (await http.post<{ jobId: string }>(`/backups/${id}/verify`)).data,
    invalidate: [settingsKeys.backups],
    success: "Restore check started",
  });
}

/** Resolves the signed download URL; the API may send `{ url }` or a bare string. */
export async function fetchBackupDownloadUrl(id: string): Promise<string | null> {
  const data = (await http.get<{ url?: string } | string>(`/backups/${id}/download`)).data;
  if (typeof data === "string") return data;
  return data?.url ?? null;
}
