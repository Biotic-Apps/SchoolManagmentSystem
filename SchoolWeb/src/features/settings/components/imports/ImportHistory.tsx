"use client";

import { useMemo } from "react";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { DataTable } from "@/components/shared/DataTable";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { importHistoryColumns } from "../../import-history-columns";
import { importKindLabel } from "../../import-kinds";
import type { ImportSummary } from "../../import-types";
import { useImportHistoryList } from "../../use-import-history";

interface ImportHistoryProps {
  branchId: string | null;
  onOpen: (item: ImportSummary) => void;
}

export function ImportHistory({ branchId, onOpen }: ImportHistoryProps) {
  const history = useImportHistoryList(branchId);
  const { revertDialog } = history;
  const columns = useMemo(
    () => importHistoryColumns({ onOpen, onRevert: revertDialog.show }),
    [onOpen, revertDialog.show],
  );
  const target = revertDialog.item;

  return (
    <section className="flex min-w-0 flex-col gap-3">
      <SectionHeading title="Import history" />
      <DataTable
        columns={columns}
        rows={history.rows}
        getRowId={(item) => item.id}
        loading={history.loading}
        error={history.error}
        onRetry={history.retry}
        onRowClick={onOpen}
        emptyTitle="No imports yet"
        emptyDescription="Files you upload for this branch are listed here."
      />
      <ConfirmDialog
        open={revertDialog.open}
        onOpenChange={revertDialog.onOpenChange}
        tone="danger"
        title="Revert this import?"
        description={
          target
            ? `Everything this ${importKindLabel(target.kind).toLowerCase()} import created is deleted. This only works while nothing else uses those records yet.`
            : undefined
        }
        confirmLabel="Revert import"
        loading={history.reverting}
        onConfirm={history.confirmRevert}
      />
    </section>
  );
}
