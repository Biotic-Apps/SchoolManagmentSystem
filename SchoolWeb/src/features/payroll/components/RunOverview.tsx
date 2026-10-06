"use client";

import { InlineNotice } from "@/components/shared/InlineNotice";
import { JobProgressNotice } from "@/components/shared/JobProgressNotice";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { StatusStepper } from "@/components/shared/StatusStepper";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { formatPeriod } from "@/lib/period";
import { payrollKeys } from "../keys";
import { RUN_STEPS } from "../options";
import type { PayrollLine, PayrollRun } from "../types";
import { useRunActions } from "../use-run-actions";
import { RunActionsBar } from "./RunActionsBar";
import { RunConfirmDialog } from "./RunConfirmDialog";

/** Run header: status, workflow progress, gated actions and the calculation job. */
export function RunOverview({ run, lines }: { run: PayrollRun; lines: PayrollLine[] }) {
  const actions = useRunActions(run, lines);
  return (
    <Card>
      <CardHeader className="gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <CardTitle>Payroll for {formatPeriod(run.month)}</CardTitle>
          <StatusBadge status={run.status} />
        </div>
        <RunActionsBar actions={actions} />
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <StatusStepper steps={RUN_STEPS} current={run.status} />
        <JobProgressNotice
          jobId={actions.jobId}
          label="Calculating salaries"
          doneLabel="Salaries calculated. Check the lines, then mark the run as reviewed."
          invalidate={[payrollKeys.all]}
        />
        {actions.awaitingApproval && <InlineNotice tone="warning">Waiting for approval. Payments open once the run is approved.</InlineNotice>}
        {actions.canClose && !actions.closeEnabled && (
          <InlineNotice>The run can be closed once every salary is fully paid.</InlineNotice>
        )}
      </CardContent>
      <RunConfirmDialog actions={actions} />
    </Card>
  );
}
