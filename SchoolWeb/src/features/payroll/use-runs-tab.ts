import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useCan } from "@/features/auth/use-can";
import { ApiError } from "@/lib/api-error";
import { errorMessage } from "@/lib/error-messages";
import { currentPeriod } from "@/lib/period";
import { toast } from "@/lib/toast";
import { useDialogState } from "@/lib/use-dialog-state";
import { payrollKeys } from "./keys";
import { lineColumns } from "./line-columns";
import { runTotals } from "./normalize";
import { CALCULATED_STATUSES, PAYABLE_STATUSES } from "./options";
import { useCreatePayrollRun, usePayrollRun, usePayrollRuns } from "./runs-api";
import type { PayrollLine } from "./types";

/** Payroll run of the chosen branch and month: list → detail, lines and per-line dialogs. */
export function useRunsTab(branchId: string | null) {
  const can = useCan();
  const queryClient = useQueryClient();
  const [month, setMonth] = useState(currentPeriod());
  const runs = usePayrollRuns(branchId, month);
  const listed = runs.data?.find((item) => item.month === month) ?? runs.data?.[0] ?? null;
  const detail = usePayrollRun(listed?.id ?? null);
  const run = detail.data ?? listed;
  const lines = useMemo(() => run?.lines ?? [], [run]);

  const payment = useDialogState<PayrollLine>();
  const payslip = useDialogState<PayrollLine>();
  const create = useCreatePayrollRun();

  const createRun = async () => {
    if (!branchId) return;
    try {
      await create.mutateAsync({ branchId, month });
    } catch (error) {
      if (error instanceof ApiError && error.status === 409) {
        toast.info("A payroll run already exists for this month.");
        await queryClient.invalidateQueries({ queryKey: payrollKeys.runs(branchId, month) });
      } else {
        toast.error(errorMessage(error));
      }
    }
  };

  const canPay = can("payroll.edit") && !!run && PAYABLE_STATUSES.includes(run.status);
  const hasPayslips = !!run && CALCULATED_STATUSES.includes(run.status);
  const columns = useMemo(
    () => lineColumns({ canPay, hasPayslips, onPay: payment.show, onPayslip: payslip.show }),
    [canPay, hasPayslips, payment.show, payslip.show],
  );

  return {
    month,
    setMonth,
    max: currentPeriod(),
    run,
    lines,
    totals: runTotals(lines),
    loading: !branchId || runs.isLoading || (!!listed && detail.isLoading),
    error: runs.error ?? detail.error,
    retry: () => (runs.error ? runs.refetch() : detail.refetch()),
    canCreate: can("payroll.add") && !!branchId,
    createRun,
    creating: create.isPending,
    columns,
    payment,
    payslip,
  };
}

export type RunsTabState = ReturnType<typeof useRunsTab>;
