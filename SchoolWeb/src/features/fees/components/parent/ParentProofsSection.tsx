"use client";

import { DataTable, type DataTableColumn } from "@/components/shared/DataTable";
import { SectionHeading } from "@/components/shared/SectionHeading";
import type { PaymentProof } from "../../types";

interface ParentProofsSectionProps {
  rows: PaymentProof[] | undefined;
  columns: DataTableColumn<PaymentProof>[];
  loading: boolean;
  error: unknown;
  onRetry: () => void;
}

export function ParentProofsSection({ rows, columns, loading, error, onRetry }: ParentProofsSectionProps) {
  return (
    <div className="flex flex-col gap-3">
      <SectionHeading title="Submitted payment proofs" />
      <DataTable
        columns={columns}
        rows={rows}
        getRowId={(row) => row.id}
        loading={loading}
        error={error}
        onRetry={onRetry}
        emptyTitle="No proofs submitted"
        emptyDescription="Proofs you upload show here until the school verifies them."
      />
    </div>
  );
}
