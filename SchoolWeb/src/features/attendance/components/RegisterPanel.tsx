"use client";

import { DataTable } from "@/components/shared/DataTable";
import { InlineNotice } from "@/components/shared/InlineNotice";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { useReportUnsaved } from "@/components/shared/UnsavedChangesGuard";
import { REGISTER_STATUS_LABEL } from "../options";
import { useRegisterPanel } from "../use-register-panel";
import { AttendanceCountsBar } from "./AttendanceCountsBar";
import { CorrectionDialog } from "./CorrectionDialog";
import { HealthAlertsNotice } from "./HealthAlertsNotice";
import { NonWorkingDayState } from "./NonWorkingDayState";
import { RegisterActions } from "./RegisterActions";
import { RegisterBanner } from "./RegisterBanner";

/** One section's register for one day. Keyed by section + date so local marks reset. */
export function RegisterPanel({ sectionId, date }: { sectionId: string; date: string }) {
  const { tab, columns, correction } = useRegisterPanel(sectionId, date);
  const { register } = tab;
  useReportUnsaved(tab.editor.dirty);

  if (tab.nonWorkingDay) return <NonWorkingDayState />;

  return (
    <div className="flex flex-col gap-4">
      {tab.notice && <InlineNotice tone="warning">{tab.notice}</InlineNotice>}
      {register && <RegisterBanner register={register} isHelper={tab.isHelper} />}
      <HealthAlertsNotice alerts={tab.alerts} />
      {register && (
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <AttendanceCountsBar counts={tab.editor.counts} />
          <StatusBadge status={register.status} label={REGISTER_STATUS_LABEL[register.status]} />
        </div>
      )}
      {tab.canEdit && register && register.entries.length > 0 && <RegisterActions tab={tab} />}
      <DataTable
        columns={columns}
        rows={tab.editor.rows}
        getRowId={(row) => row.studentId}
        loading={tab.query.isLoading}
        error={tab.query.error}
        onRetry={() => tab.query.refetch()}
        skeletonRows={8}
        emptyTitle="No students in this section"
        emptyDescription="Students appear here once they are enrolled in the section."
      />
      {correction.item && <CorrectionDialog entry={correction.item} onClose={correction.close} />}
    </div>
  );
}
