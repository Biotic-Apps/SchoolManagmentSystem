import { useQuery } from "@tanstack/react-query";
import { downloadBlob } from "@/lib/download-blob";
import { http } from "@/lib/http";
import { useApiMutation } from "@/lib/use-api-mutation";
import { IMPORT_BUSY_STATUSES, IMPORT_POLL_MS } from "./import-kinds";
import { normaliseDetail, normaliseHistory } from "./import-normalise";
import type { ImportKind, ImportUploadInput } from "./import-types";
import { settingsKeys } from "./keys";

export function useImportHistory(branchId: string | null) {
  return useQuery({
    queryKey: settingsKeys.imports(branchId),
    queryFn: async () => normaliseHistory((await http.get<unknown>("/imports", { branchId })).data),
    enabled: !!branchId,
  });
}

/**
 * Import detail, polled every 2 s while the server validates or commits.
 * `awaitingCommit` keeps polling after a commit request until the status leaves READY/INVALID.
 */
export function useImportDetail(id: string | null, awaitingCommit = false) {
  return useQuery({
    queryKey: settingsKeys.importDetail(id ?? ""),
    queryFn: async () => normaliseDetail((await http.get<Record<string, unknown>>(`/imports/${id}`)).data ?? {}),
    enabled: !!id,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      if (!status) return false;
      const pending = awaitingCommit && (status === "READY" || status === "INVALID");
      return pending || IMPORT_BUSY_STATUSES.includes(status) ? IMPORT_POLL_MS : false;
    },
  });
}

export function useUploadImport() {
  return useApiMutation({
    mutationFn: async ({ file, kind, branchId, sessionId }: ImportUploadInput) => {
      const form = new FormData();
      form.append("file", file);
      form.append("kind", kind);
      form.append("branchId", branchId);
      form.append("sessionId", sessionId);
      const { data } = await http.upload<{ importId?: string; id?: string }>("/imports", form);
      return String(data?.importId ?? data?.id ?? "");
    },
    invalidate: [settingsKeys.all],
    toastError: false,
  });
}

export function useCommitImport() {
  return useApiMutation({
    mutationFn: ({ id, skipInvalid }: { id: string; skipInvalid: boolean }) =>
      http.post(`/imports/${id}/commit`, skipInvalid ? { skipInvalid: true } : {}),
    invalidate: [settingsKeys.all],
    success: "Import started. Rows are being applied.",
  });
}

export function useRevertImport() {
  return useApiMutation({
    mutationFn: (id: string) => http.post(`/imports/${id}/revert`),
    invalidate: [settingsKeys.all],
    success: "Import reverted.",
    toastError: false,
  });
}

export function downloadImportTemplate(kind: ImportKind) {
  return downloadBlob(`/imports/templates/${kind}`, `${kind}-template.xlsx`);
}
