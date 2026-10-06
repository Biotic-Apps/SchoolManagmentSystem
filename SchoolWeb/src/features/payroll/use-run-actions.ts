import { useState } from "react";
import { useCan } from "@/features/auth/use-can";
import { toast } from "@/lib/toast";
import { useDialogState } from "@/lib/use-dialog-state";
import {
  useApprovePayrollRun,
  useCalculatePayrollRun,
  useClosePayrollRun,
  useReviewPayrollRun,
} from "./runs-api";
import type { PayrollLine, PayrollRun, PayrollRunStatus } from "./types";

const CLOSABLE: PayrollRunStatus[] = ["APPROVED", "PARTIALLY_PAID", "PAID"];

export type RunConfirm = "approve" | "close";

/** Status- and permission-gated run actions; calculation runs as a background job. */
export function useRunActions(run: PayrollRun, lines: PayrollLine[]) {
  const can = useCan();
  const calculate = useCalculatePayrollRun();
  const review = useReviewPayrollRun();
  const approve = useApprovePayrollRun();
  const close = useClosePayrollRun();
  const confirm = useDialogState<RunConfirm>();
  const [job, setJob] = useState<{ runId: string; jobId: string } | null>(null);

  const status = run.status;
  const awaitingApproval = run.approval?.status === "PENDING";
  const allPaid = lines.length > 0 && lines.every((line) => line.balanceMinor <= 0);

  const startCalculation = () =>
    calculate.mutate(run.id, {
      onSuccess: (result) => {
        if (result?.jobId) setJob({ runId: run.id, jobId: result.jobId });
        else toast.success("Payroll calculated");
      },
    });

  const confirmAction = () => {
    const mutation = confirm.item === "approve" ? approve : close;
    mutation.mutate(run.id, { onSuccess: confirm.close });
  };

  return {
    jobId: job?.runId === run.id ? job.jobId : null,
    awaitingApproval,
    canCalculate: can("payroll.edit") && (status === "DRAFT" || status === "CALCULATED"),
    calculateLabel: status === "DRAFT" ? "Calculate" : "Recalculate",
    calculating: calculate.isPending,
    startCalculation,
    canReview: can("payroll.edit") && status === "CALCULATED",
    reviewing: review.isPending,
    markReviewed: () => review.mutate(run.id),
    canSendForApproval: can("payroll.approve") && status === "REVIEWED" && !awaitingApproval,
    canClose: can("payroll.approve") && CLOSABLE.includes(status),
    closeEnabled: allPaid,
    confirm,
    confirming: approve.isPending || close.isPending,
    confirmAction,
  };
}

export type RunActionsState = ReturnType<typeof useRunActions>;
