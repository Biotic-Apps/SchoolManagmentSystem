"use client";

import { DataTable } from "@/components/shared/DataTable";
import { ReasonDialog } from "@/components/shared/ReasonDialog";
import { BranchPickerSelect } from "@/features/branches/components/BranchPickerSelect";
import { moderationColumns } from "../moderation-columns";
import { useModerationTab } from "../use-moderation-tab";

export function ModerationTab() {
  const tab = useModerationTab();
  const target = tab.returning.item;
  const columns = moderationColumns({
    publishingId: tab.publishingId,
    onPublish: tab.approve,
    onReturn: (entry) => tab.returning.show(entry),
  });

  return (
    <div className="flex flex-col gap-4">
      <BranchPickerSelect picker={tab.picker} />
      <DataTable
        columns={columns}
        rows={tab.rows}
        getRowId={(row) => row.id}
        loading={tab.picker.isLoading || tab.query.isLoading}
        error={tab.query.error}
        onRetry={() => tab.query.refetch()}
        emptyTitle="Nothing waiting for moderation"
        emptyDescription="Diary entries submitted by teachers appear here."
      />
      <ReasonDialog
        open={tab.returning.open}
        onOpenChange={tab.returning.onOpenChange}
        title="Return diary entry"
        description={target ? `${target.subject.name} · ${target.className} ${target.sectionName}` : undefined}
        label="Comment"
        submitLabel="Return"
        submitting={tab.returnPending}
        onSubmit={tab.confirmReturn}
      />
    </div>
  );
}
