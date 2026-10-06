"use client";

import { CheckCheck, Save } from "lucide-react";
import { DataTable } from "@/components/shared/DataTable";
import { Button } from "@/components/ui/Button";
import { isNonWorkingDay } from "../register-errors";
import { staffAttendanceColumns } from "../staff-attendance-columns";
import { useStaffAttendanceEditor } from "../use-staff-attendance-editor";
import { AttendanceCountsBar } from "./AttendanceCountsBar";
import { NonWorkingDayState } from "./NonWorkingDayState";

/** Editable staff register for one branch and day (keyed by both). */
export function StaffAttendancePanel({ branchId, date }: { branchId: string; date: string }) {
  const editor = useStaffAttendanceEditor(branchId, date);
  const hasRows = editor.rows.length > 0;

  if (isNonWorkingDay(editor.query.error)) return <NonWorkingDayState />;

  return (
    <div className="flex flex-col gap-4">
      {hasRows && (
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <AttendanceCountsBar counts={editor.counts} />
          <div className="flex flex-wrap items-center gap-2">
            {editor.dirty && <span className="text-label text-warning">Unsaved changes</span>}
            {editor.counts.unmarked > 0 && (
              <Button variant="secondary" onClick={editor.markAllPresent} disabled={editor.saving}>
                <CheckCheck />
                Mark remaining present
              </Button>
            )}
            <Button onClick={editor.save} loading={editor.saving} disabled={!editor.dirty}>
              <Save />
              Save
            </Button>
          </div>
        </div>
      )}
      <DataTable
        columns={staffAttendanceColumns(editor.update)}
        rows={editor.rows}
        getRowId={(row) => row.staffId}
        loading={editor.loading}
        error={editor.query.error}
        onRetry={() => editor.query.refetch()}
        skeletonRows={6}
        emptyTitle="No active staff"
        emptyDescription="Staff of this branch appear here once they are added in Staff."
      />
    </div>
  );
}
