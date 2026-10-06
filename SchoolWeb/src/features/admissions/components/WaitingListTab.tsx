"use client";

import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { DataTable } from "@/components/shared/DataTable";
import type { AcademicScope } from "@/features/classes/use-academic-scope";
import { childName } from "../status";
import { useWaitingListTab } from "../use-waiting-list-tab";

interface WaitingListTabProps {
  scope: AcademicScope;
  onOpen: (applicationId: string) => void;
}

export function WaitingListTab({ scope, onOpen }: WaitingListTabProps) {
  const tab = useWaitingListTab(scope);
  const target = tab.offerTarget.item;

  return (
    <div className="flex flex-col gap-4">
      <p className="text-label text-fg-muted">
        Waitlisted applications in queue order for the selected session{scope.classId ? " and class" : ""}.
      </p>
      <DataTable
        columns={tab.columns}
        rows={tab.rows}
        getRowId={(row) => row.id}
        loading={tab.query.isLoading}
        error={tab.query.error}
        onRetry={() => tab.query.refetch()}
        onRowClick={(row) => onOpen(row.id)}
        emptyTitle="Waiting list is empty"
        emptyDescription="Applications you waitlist when deciding appear here in order."
        pagination={tab.pagination}
      />
      <ConfirmDialog
        open={!!target}
        onOpenChange={tab.offerTarget.onOpenChange}
        title={target ? `Offer a seat to ${childName(target)}?` : "Offer a seat?"}
        description="The application moves to Offered and the primary guardian is notified."
        confirmLabel="Offer seat"
        loading={tab.offering}
        onConfirm={tab.confirmOffer}
      />
    </div>
  );
}
