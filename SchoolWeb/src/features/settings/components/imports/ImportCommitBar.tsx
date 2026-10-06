import { Check, Upload } from "lucide-react";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { Button } from "@/components/ui/Button";
import { formatNumber } from "@/lib/format";
import type { ImportFlow } from "../../use-import-flow";

function rowsLabel(count: number): string {
  return `${formatNumber(count)} ${count === 1 ? "row" : "rows"}`;
}

export function ImportCommitBar({ flow }: { flow: ImportFlow }) {
  const { valid, invalid } = flow.totals;
  const dialog = flow.commitDialog;
  const skipping = dialog.item === "skip";

  if (!flow.canCommitAll && !flow.canCommitValid && !flow.needsNewFile) return null;

  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
      {(flow.canCommitValid || flow.needsNewFile) && (
        <Button variant="secondary" onClick={flow.pickFile} loading={flow.uploading}>
          <Upload />
          Upload a corrected file
        </Button>
      )}
      {flow.canCommitValid && (
        <Button variant="danger" onClick={() => dialog.show("skip")}>
          Commit valid rows only
        </Button>
      )}
      {flow.canCommitAll && (
        <Button onClick={() => dialog.show("all")}>
          <Check />
          Commit {rowsLabel(valid)}
        </Button>
      )}
      <ConfirmDialog
        open={dialog.open}
        onOpenChange={dialog.onOpenChange}
        tone={skipping ? "danger" : "primary"}
        title={skipping ? "Commit valid rows only?" : `Commit ${rowsLabel(valid)}?`}
        description={
          skipping
            ? `${rowsLabel(invalid)} with problems will be skipped and not imported. The ${rowsLabel(valid)} that passed are applied in one transaction.`
            : `All ${rowsLabel(valid)} are applied in one transaction. If anything fails, nothing is saved.`
        }
        confirmLabel={skipping ? `Commit ${rowsLabel(valid)}` : "Commit"}
        loading={flow.committing}
        onConfirm={flow.confirmCommit}
      />
    </div>
  );
}
