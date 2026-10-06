"use client";

import { DataTable } from "@/components/shared/DataTable";
import { FilterBar } from "@/components/shared/FilterBar";
import { FilterSelect } from "@/components/shared/FilterSelect";
import { ReasonDialog } from "@/components/shared/ReasonDialog";
import { TRANSFER_DIRECTION_OPTIONS, TRANSFER_STATUS_OPTIONS } from "../options";
import { useTransfersTab } from "../use-transfers-tab";
import { AcceptTransferDialog } from "./AcceptTransferDialog";

export function TransfersTab({ branchId, sessionId }: { branchId: string; sessionId: string }) {
  const tab = useTransfersTab(branchId);
  const { list, query } = tab;
  const closing = tab.closing.item;
  const rejecting = closing?.action === "reject";

  return (
    <div className="flex flex-col gap-4">
      <FilterBar onReset={list.reset}>
        <FilterSelect
          label="Direction"
          allLabel="Both directions"
          options={TRANSFER_DIRECTION_OPTIONS}
          value={list.filters.direction}
          onChange={(value) => list.setFilter("direction", value)}
        />
        <FilterSelect
          label="Status"
          allLabel="All statuses"
          options={TRANSFER_STATUS_OPTIONS}
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
        emptyTitle="No transfers"
        emptyDescription="Transfers requested from a student page appear here for both branches."
        pagination={tab.pagination}
      />
      {tab.accept.item && (
        <AcceptTransferDialog
          transfer={tab.accept.item}
          branchId={branchId}
          sessionId={sessionId}
          onClose={tab.accept.close}
        />
      )}
      {closing && (
        <ReasonDialog
          open
          onOpenChange={tab.closing.onOpenChange}
          title={`${rejecting ? "Reject" : "Cancel"} transfer of ${closing.transfer.student.name}?`}
          description={rejecting ? "The student stays in the source branch." : "The transfer request is withdrawn."}
          submitLabel={rejecting ? "Reject transfer" : "Cancel transfer"}
          submitting={tab.closeSubmitting}
          error={tab.closeError}
          onSubmit={tab.confirmClose}
        />
      )}
    </div>
  );
}
