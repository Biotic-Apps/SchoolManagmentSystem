import { useState } from "react";
import { useCan } from "@/features/auth/use-can";
import { useClassOptions } from "@/features/classes/api";
import { useSessionOptions } from "@/features/sessions/api";
import { paginationFrom } from "@/lib/pagination";
import { currentPeriod } from "@/lib/period";
import { toast } from "@/lib/toast";
import { useDialogState } from "@/lib/use-dialog-state";
import { useListState } from "@/lib/use-list-state";
import type { PrintChallansJob } from "./challan-print";
import { useInvoices, useIssueInvoices } from "./invoices-api";
import { useInvoiceSelection } from "./use-invoice-selection";

interface InvoicesScope {
  branchId: string | null;
  schoolId: string | null;
}

/** Invoices of one branch and billing month, with bulk issue, generation, challan printing and ad-hoc invoices. */
export function useInvoicesTab({ branchId, schoolId }: InvoicesScope) {
  const can = useCan();
  const list = useListState<{ status?: string; classId?: string }>({ status: undefined, classId: undefined });
  const [period, setPeriodValue] = useState(currentPeriod);
  const query = useInvoices({ ...list.params, branchId, period }, !!branchId);
  const rows = query.data?.data;
  const classes = useClassOptions(schoolId);
  const sessions = useSessionOptions(branchId);
  const selection = useInvoiceSelection(rows);
  const issue = useIssueInvoices();
  const [jobId, setJobId] = useState<string | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const generateDialog = useDialogState<null>();
  const createDialog = useDialogState<null>();
  const printDialog = useDialogState<null>();
  const [printJob, setPrintJob] = useState<PrintChallansJob | null>(null);

  return {
    list,
    period,
    setPeriod: (value: string) => {
      setPeriodValue(value);
      list.setPage(1);
    },
    query,
    rows,
    pagination: paginationFrom(query.data?.meta, list.setPage),
    classOptions: classes.options,
    sessionOptions: sessions.options,
    activeSessionId: sessions.activeId,
    canAdd: can("fees.add"),
    canIssue: can("fees.approve"),
    canPrint: can("fees.view"),
    selection,
    issuing: issue.isPending,
    issueSelected: () => issue.mutate(selection.selectedIds, { onSuccess: selection.clear }),
    generateDialog,
    createDialog,
    printDialog,
    printJob,
    onPrintStarted: (job: PrintChallansJob) => {
      setPrintJob(job);
      toast.info(`Preparing ${job.count} challans in the background`);
    },
    jobId,
    onGenerated: (result: { jobId?: string | null } | null) => {
      if (result?.jobId) {
        setJobId(result.jobId);
        toast.info("Generating invoices in the background");
      } else toast.success("Invoices generated");
    },
    openId,
    openInvoice: setOpenId,
    closeInvoice: () => setOpenId(null),
  };
}

export type InvoicesTab = ReturnType<typeof useInvoicesTab>;
