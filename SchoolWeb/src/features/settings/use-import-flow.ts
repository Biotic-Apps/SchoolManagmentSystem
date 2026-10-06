import { useCallback, useState } from "react";
import { useDialogState } from "@/lib/use-dialog-state";
import { IMPORT_BUSY_STATUSES, IMPORT_FILE_EXTENSIONS, IMPORT_MAX_SIZE_MB } from "./import-kinds";
import { importStep } from "./import-steps";
import { useCommitImport, useImportDetail, useUploadImport } from "./imports-api";
import type { ImportContextState } from "./use-import-context";

export const IMPORT_FILE_INPUT_ID = "import-file-input";

export type CommitMode = "all" | "skip";

function fileProblem(file: File): string | null {
  const name = file.name.toLowerCase();
  if (!IMPORT_FILE_EXTENSIONS.some((ext) => name.endsWith(ext))) return "Choose an .xlsx or .csv file.";
  if (file.size > IMPORT_MAX_SIZE_MB * 1024 * 1024) return `The file must be ${IMPORT_MAX_SIZE_MB} MB or smaller.`;
  return null;
}

/** Upload → validate (polled) → review → commit (polled) → done, for one import at a time. */
export function useImportFlow(context: ImportContextState) {
  const [importId, setImportId] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [committed, setCommitted] = useState(false);

  const upload = useUploadImport();
  const commit = useCommitImport();
  const detailQuery = useImportDetail(importId, committed);
  const commitDialog = useDialogState<CommitMode>();

  const detail = detailQuery.data ?? null;
  const totals = detail?.totals ?? { rows: 0, valid: 0, invalid: 0 };
  const status = detail?.status;

  const selectFile = (file: File) => {
    const problem = fileProblem(file);
    setFileError(problem);
    if (problem || !context.branchId || !context.sessionId) return;
    upload.mutate(
      { file, kind: context.kind, branchId: context.branchId, sessionId: context.sessionId },
      {
        onSuccess: (id) => {
          setImportId(id || null);
          setFileName(file.name);
          setCommitted(false);
        },
      },
    );
  };

  const confirmCommit = () => {
    if (!importId || !commitDialog.item) return;
    commit.mutate(
      { id: importId, skipInvalid: commitDialog.item === "skip" },
      {
        onSuccess: () => {
          commitDialog.close();
          setCommitted(true);
          void detailQuery.refetch();
        },
      },
    );
  };

  const open = useCallback((id: string) => {
    setImportId(id);
    setFileName(null);
    setCommitted(false);
  }, []);

  const reset = () => {
    setImportId(null);
    setFileName(null);
    setFileError(null);
    upload.reset();
  };

  return {
    importId,
    fileName: detail?.fileName ?? fileName,
    pickFile: () => document.getElementById(IMPORT_FILE_INPUT_ID)?.click(),
    selectFile,
    fileError,
    uploading: upload.isPending,
    uploadError: upload.error,
    detail,
    detailLoading: detailQuery.isLoading,
    detailError: detailQuery.error,
    retryDetail: () => void detailQuery.refetch(),
    totals,
    busy: !!status && IMPORT_BUSY_STATUSES.includes(status),
    step: importStep(status, committed),
    canCommitAll: !committed && status === "READY" && totals.invalid === 0 && totals.valid > 0,
    canCommitValid: !committed && (status === "READY" || status === "INVALID") && totals.invalid > 0 && totals.valid > 0,
    needsNewFile: status === "INVALID" && totals.valid === 0,
    commitDialog,
    confirmCommit,
    committing: commit.isPending,
    open,
    reset,
  };
}

export type ImportFlow = ReturnType<typeof useImportFlow>;
