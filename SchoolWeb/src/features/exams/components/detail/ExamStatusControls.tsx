"use client";

import { Calculator, CheckCircle2, Lock, Megaphone, RotateCcw, Unlock } from "lucide-react";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { InlineNotice } from "@/components/shared/InlineNotice";
import { ReasonDialog } from "@/components/shared/ReasonDialog";
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
  MARKS_CLOSED:
    "Compute results, check them, then send them for the principal's approval. To fix marks, reopen marks entry.",
  RESULTS_APPROVED: "Publish to share results and report cards with parents. To fix marks first, reopen marks entry.",
  PUBLISHED: "Results are published. Parents can see them and download report cards.",
};

export function ExamStatusControls({ exam }: { exam: Exam }) {
  const actions = useExamStatusActions(exam);
  const hasActions =
    actions.canOpenMarks ||
    actions.canCloseMarks ||
    actions.canCompute ||
    actions.canSendForApproval ||
    actions.canPublish ||
    actions.canReopenMarks;

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
              <Button variant="secondary" onClick={() => actions.setConfirmClose(true)}>
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
            {actions.canReopenMarks && (
              <Button variant="secondary" onClick={() => actions.setReopenOpen(true)}>
                <RotateCcw />
                Reopen marks entry
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
        open={actions.confirmClose}
        onOpenChange={actions.setConfirmClose}
        title="Close marks entry?"
        description="Teachers can no longer enter or change marks. Every mark sheet must be accepted, with marks or Absent for every student. A principal can reopen marks entry later, until results are published."
        confirmLabel="Close marks entry"
        loading={actions.statusPending}
        onConfirm={actions.closeMarks}
      />
      <ReasonDialog
        open={actions.reopenOpen}
        onOpenChange={actions.setReopenOpen}
        title="Reopen marks entry?"
        description="Use this to fix marks after closing, for example when a student joined after a sheet was accepted. Any results approval is cancelled; compute and approve the results again afterwards. The reason is kept in the audit log."
        submitLabel="Reopen marks entry"
        submitting={actions.reopening}
        error={actions.dialogError}
        onSubmit={actions.reopenMarks}
      />
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
