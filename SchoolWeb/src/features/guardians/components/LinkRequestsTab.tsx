"use client";

import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { DataTable } from "@/components/shared/DataTable";
import { ReasonDialog } from "@/components/shared/ReasonDialog";
import { useLinkRequestsTab } from "../use-link-requests-tab";

export function LinkRequestsTab({ branchId }: { branchId: string }) {
  const tab = useLinkRequestsTab(branchId);
  const { query } = tab;
  const approving = tab.approveTarget.item;
  const rejecting = tab.rejectTarget.item;

  return (
    <div className="flex flex-col gap-4">
      <DataTable
        columns={tab.columns}
        rows={tab.rows}
        getRowId={(row) => row.id}
        loading={query.isLoading}
        error={query.error}
        onRetry={() => query.refetch()}
        emptyTitle="No pending link requests"
        emptyDescription="Parents request a link from their app with the admission number, date of birth and an OTP."
        pagination={tab.pagination}
      />
      <ConfirmDialog
        open={!!approving}
        onOpenChange={tab.approveTarget.onOpenChange}
        title={`Link ${approving?.guardian.name ?? "parent"} to ${approving?.student.name ?? "student"}?`}
        description={tab.error ?? "The parent can then see this child in their app."}
        confirmLabel="Approve"
        loading={tab.deciding}
        onConfirm={tab.approve}
      />
      {rejecting && (
        <ReasonDialog
          open
          onOpenChange={tab.rejectTarget.onOpenChange}
          title={`Reject link request from ${rejecting.guardian.name}?`}
          description={`For ${rejecting.student.name} (${rejecting.student.admissionNo}).`}
          submitLabel="Reject request"
          submitting={tab.deciding}
          error={tab.error}
          onSubmit={tab.reject}
        />
      )}
    </div>
  );
}
