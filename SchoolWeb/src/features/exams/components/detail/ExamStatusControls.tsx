"use client";

import { Calculator, CheckCircle2, Lock, Megaphone, Unlock } from "lucide-react";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { InlineNotice } from "@/components/shared/InlineNotice";
import { JobProgressNotice } from "@/components/shared/JobProgressNotice";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { examsKeys } from "../../keys";
import type { Exam } from "../../types";
import { useExamStatusActions } from "../../use-exam-status-actions";
import { UnacceptedSheetsNotice } from "./UnacceptedSheetsNotice";

const NEXT_STEP_HINT: Partial<Record<Exam["status"], string>> = {
  DRAFT: "Save the date sheet on the Schedule tab to schedule this exam.",
  SCHEDULED: "Open marks entry when teachers can start entering marks.",
  MARKS_OPEN: "Close marks entry once all mark sheets are submitted and accepted.",
  MARKS_CLOSED: "Compute results, check them, then send them for the principal's approval.",
  RESULTS_APPROVED: "Publish to share results and report cards with parents.",
  PUBLISHED: "Results are published. Parents can see them and download report cards.",
};

export function ExamStatusControls({ exam }: { exam: Exam }) {
  const actions = useExamStatusActions(exam);
  const hasActions =
    actions.canOpenMarks || actions.canCloseMarks || actions.canCompute || actions.canSendForApproval || actions.canPublish;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Next step</CardTitle>
        <CardDescription>{NEXT_STEP_HINT[exam.status]}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {actions.awaitingApproval && <InlineNotice>Results are waiting for the principal&apos;s approval.</InlineNotice>}
        <JobProgressNotice
          jobId={actions.jobId}
          label="Computing results"
          doneLabel="Results computed. Review them on the Results tab."
          invalidate={[examsKeys.all]}
        />
        {actions.blocking && <UnacceptedSheetsNotice sheets={actions.blocking} />}
        {hasActions && (
          <div className="flex flex-wrap gap-2">
            {actions.canOpenMarks && (
              <Button onClick={actions.openMarks} loading={actions.statusPending}>
                <Unlock />
                Open marks entry
              </Button>
            )}
            {actions.canCloseMarks && (
              <Button variant="secondary" onClick={actions.closeMarks} loading={actions.statusPending}>
                <Lock />
                Close marks entry
              </Button>
            )}
            {actions.canCompute && (
              <Button variant="secondary" onClick={actions.compute} loading={actions.computing}>
                <Calculator />
                Compute results
              </Button>
            )}
            {actions.canSendForApproval && (
              <Button onClick={actions.sendForApproval} loading={actions.approving}>
                <CheckCircle2 />
                Approve results
              </Button>
            )}
            {actions.canPublish && (
              <Button onClick={() => actions.setConfirmPublish(true)}>
                <Megaphone />
                Publish results
              </Button>
            )}
          </div>
        )}
      </CardContent>
      <ConfirmDialog
        open={actions.confirmPublish}
        onOpenChange={actions.setConfirmPublish}
        title="Publish results?"
        description="Parents are notified and report cards are generated for every student. Published results can't be unpublished."
        confirmLabel="Publish"
        loading={actions.publishing}
        onConfirm={actions.publish}
      />
    </Card>
  );
}
