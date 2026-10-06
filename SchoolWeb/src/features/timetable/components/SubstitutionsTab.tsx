"use client";

import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { DataTable } from "@/components/shared/DataTable";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { TabToolbar } from "@/features/classes/components/TabToolbar";
import { formatDate } from "@/lib/format";
import { useSubstitutionsTab } from "../use-substitutions-tab";
import { OverrideFormDialog } from "./OverrideFormDialog";

interface SubstitutionsTabProps {
  branchId: string;
  sessionId: string | null;
  canEdit: boolean;
}

export function SubstitutionsTab({ branchId, sessionId, canEdit }: SubstitutionsTabProps) {
  const tab = useSubstitutionsTab(branchId, sessionId, canEdit);
  const target = tab.deleteTarget.item;

  return (
    <div className="flex flex-col gap-4">
      <TabToolbar addLabel="Assign substitute" onAdd={canEdit ? () => tab.form.show(true) : undefined}>
        <div className="flex flex-col gap-1.5 md:w-56">
          <Label htmlFor="substitution-date">Date</Label>
          <Input id="substitution-date" type="date" value={tab.date} onChange={(event) => tab.setDate(event.target.value)} />
        </div>
      </TabToolbar>
      <DataTable
        columns={tab.columns}
        rows={tab.rows}
        getRowId={(row) => row.id}
        loading={tab.query.isLoading}
        error={tab.query.error}
        onRetry={() => tab.query.refetch()}
        emptyTitle={`No substitutions on ${formatDate(tab.date)}`}
        emptyDescription="Assign a substitute when a teacher is absent; they see the period in their week."
      />
      {tab.form.open && (
        <OverrideFormDialog branchId={branchId} sessionId={sessionId} date={tab.date} onClose={tab.form.close} />
      )}
      <ConfirmDialog
        open={!!target}
        onOpenChange={tab.deleteTarget.onOpenChange}
        title="Remove this substitution?"
        description="The period goes back to the timetabled teacher."
        confirmLabel="Remove"
        tone="danger"
        loading={tab.deleting}
        onConfirm={tab.confirmDelete}
      />
    </div>
  );
}
