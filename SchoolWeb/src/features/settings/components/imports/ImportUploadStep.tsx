import type { ChangeEvent } from "react";
import { FileSpreadsheet, Upload } from "lucide-react";
import { InlineNotice } from "@/components/shared/InlineNotice";
import { Button } from "@/components/ui/Button";
import { errorMessage } from "@/lib/error-messages";
import { IMPORT_FILE_ACCEPT, IMPORT_MAX_SIZE_MB } from "../../import-kinds";
import { IMPORT_FILE_INPUT_ID, type ImportFlow } from "../../use-import-flow";

export function ImportUploadStep({ flow, disabled }: { flow: ImportFlow; disabled?: boolean }) {
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (file) flow.selectFile(file);
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Button loading={flow.uploading} disabled={disabled} onClick={flow.pickFile}>
          <Upload />
          {flow.importId ? "Upload another file" : "Upload file"}
        </Button>
        {flow.fileName && (
          <span className="flex min-w-0 items-center gap-2 text-label text-fg">
            <FileSpreadsheet className="size-4 shrink-0 text-primary" />
            <span className="break-all">{flow.fileName}</span>
          </span>
        )}
        <input
          id={IMPORT_FILE_INPUT_ID}
          type="file"
          accept={IMPORT_FILE_ACCEPT}
          className="sr-only"
          tabIndex={-1}
          aria-label="Import file"
          onChange={handleChange}
        />
      </div>
      {flow.fileError ? (
        <p role="alert" className="text-caption text-error">
          {flow.fileError}
        </p>
      ) : (
        <p className="text-caption text-fg-muted">.xlsx or .csv, up to {IMPORT_MAX_SIZE_MB} MB.</p>
      )}
      {!!flow.uploadError && <InlineNotice tone="error">{errorMessage(flow.uploadError)}</InlineNotice>}
    </div>
  );
}
