"use client";

import { Plus } from "lucide-react";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { DataTable } from "@/components/shared/DataTable";
import { Button } from "@/components/ui/Button";
import { humanize } from "@/lib/format";
import { useAssignmentsTab } from "../use-assignments-tab";
import { AssignmentFormDialog } from "./AssignmentFormDialog";
import { SessionPicker } from "./SessionPicker";

interface AssignmentsTabProps {
  staffId: string;
  branchId: string | null;
  canEdit: boolean;
}

export function AssignmentsTab({ staffId, branchId, canEdit }: AssignmentsTabProps) {
  const tab = useAssignmentsTab(staffId, branchId, canEdit);
  const ending = tab.endTarget.item;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SessionPicker picker={tab.session} />
        {tab.canAdd && (
          <Button onClick={() => tab.add.show(true)} className="self-start">
            <Plus />
            Add assignment
          </Button>
        )}
      </div>
      <DataTable
        columns={tab.columns}
        rows={tab.rows}
        getRowId={(row) => row.id}
        loading={tab.loading}
        error={tab.query.error}
        onRetry={() => tab.query.refetch()}
        emptyTitle={tab.hasSessions ? "No assignments in this session" : "No academic sessions yet"}
        emptyDescription={
          tab.hasSessions
            ? "Assign this staff member as class teacher, subject teacher, helper or supervisor."
            : "Create a session in Sessions & Calendar before assigning staff."
        }
      />
      {tab.add.open && branchId && (
        <AssignmentFormDialog
          staffId={staffId}
          branchId={branchId}
          sessionId={tab.session.sessionId}
          sessionOptions={tab.session.options}
          onClose={tab.add.close}
        />
      )}
      <ConfirmDialog
        open={!!ending}
        onOpenChange={tab.endTarget.onOpenChange}
        title={`End ${ending ? humanize(ending.kind).toLowerCase() : ""} assignment?`}
        description="The staff member loses access through this assignment now. It stays in the history."
        confirmLabel="End assignment"
        tone="danger"
        loading={tab.ending}
        onConfirm={tab.confirmEnd}
      />
    </div>
  );
}
