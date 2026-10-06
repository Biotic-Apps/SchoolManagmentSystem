"use client";

import { DataTable } from "@/components/shared/DataTable";
import { FilterBar } from "@/components/shared/FilterBar";
import { FilterSelect } from "@/components/shared/FilterSelect";
import { InlineNotice } from "@/components/shared/InlineNotice";
import { PROOF_STATUS_OPTIONS } from "../../proof-options";
import { useProofsTab } from "../../use-proofs-tab";
import { ProofDetailDrawer } from "./ProofDetailDrawer";

export function ProofsTab({ branchId }: { branchId: string | null }) {
  const tab = useProofsTab(branchId);
  const { list, query, detail } = tab;

  return (
    <div className="flex flex-col gap-4">
      <InlineNotice>An uploaded proof alone never marks an invoice paid. Check the bank or wallet, then verify it.</InlineNotice>
      <FilterBar onReset={list.reset}>
        <FilterSelect
          label="Status"
          options={PROOF_STATUS_OPTIONS}
          value={list.filters.status}
          onChange={(value) => list.setFilter("status", value)}
        />
      </FilterBar>
      <DataTable
        columns={tab.columns}
        rows={tab.rows}
        getRowId={(row) => row.id}
        loading={query.isLoading}
        error={query.error}
        onRetry={() => query.refetch()}
        onRowClick={detail.show}
        emptyTitle="No payment proofs"
        emptyDescription="Proofs parents upload for bank or wallet payments wait here for verification."
        pagination={tab.pagination}
      />
      <ProofDetailDrawer proof={detail.item} open={detail.open} onOpenChange={detail.onOpenChange} canReview={tab.canReview} />
    </div>
  );
}
