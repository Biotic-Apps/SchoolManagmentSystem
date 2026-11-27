import { useState } from "react";
import { useCan } from "@/features/auth/use-can";
import { errorMessage } from "@/lib/error-messages";
import { toast } from "@/lib/toast";
import { conflictItems, unacceptedSheets, type UnacceptedSheet } from "./conflict-details";
import { useIsExamManager } from "./use-exam-manager";
import { useApproveResults, useComputeResults, useExamStatus, usePublishExam, useReopenMarks } from "./exams-api";
import type { Exam } from "./types";

/** Workflow buttons on the exam overview, gated by permission and status. */
export function useExamStatusActions(exam: Exam) {
  const can = useCan();
  const status = useExamStatus(exam.id);
  const compute = useComputeResults(exam.id);
  const approve = useApproveResults(exam.id);
  const publish = usePublishExam(exam.id);
  const reopen = useReopenMarks(exam.id);
  const [jobId, setJobId] = useState<string | null>(null);
  const [blocking, setBlocking] = useState<UnacceptedSheet[] | null>(null);
  const [confirmPublish, setConfirmPublish] = useState(false);
  const [confirmClose, setConfirmClose] = useState(false);
  const [reopenOpen, setReopenOpen] = useState(false);
  const [dialogError, setDialogError] = useState<string | null>(null);

  const manager = useIsExamManager();
  const canEdit = can("exams.edit") && manager;
  const canApprove = can("exams.approve");
  const awaitingApproval = exam.status === "MARKS_CLOSED" && !!exam.approvalId;

  /** 409 with sheet details → inline list; anything else → toast. */
  const showBlocking = (error: unknown) => {
    const items = conflictItems(error);
    if (items && items.length > 0) setBlocking(unacceptedSheets(items));
    else toast.error(errorMessage(error));
  };

  const sendForApproval = () => {
    setBlocking(null);
    approve.mutate(undefined, { onError: showBlocking });
  };

  const closeMarks = () => {
    setBlocking(null);
    status.mutate(
      { status: "MARKS_CLOSED" },
      {
        onSuccess: () => setConfirmClose(false),
        onError: (error) => {
          setConfirmClose(false);
          showBlocking(error);
        },
      },
    );
  };

  const reopenMarks = (reason: string) => {
    setDialogError(null);
    reopen.mutate(reason, {
      onSuccess: () => {
        setReopenOpen(false);
        setBlocking(null);
      },
      onError: (error) => setDialogError(errorMessage(error)),
    });
  };

  const resultsEditable = exam.status === "MARKS_CLOSED" || exam.status === "RESULTS_APPROVED";

  return {
    canOpenMarks: canEdit && exam.status === "SCHEDULED",
    canCloseMarks: canEdit && exam.status === "MARKS_OPEN",
    canCompute: canApprove && exam.status === "MARKS_CLOSED",
    canSendForApproval: canApprove && exam.status === "MARKS_CLOSED" && !awaitingApproval,
    canPublish: can("exams.publish") && exam.status === "RESULTS_APPROVED",
    awaitingApproval,
    canReopenMarks: can("exams.publish") && resultsEditable && !awaitingApproval,
    openMarks: () => status.mutate({ status: "MARKS_OPEN" }, { onError: (error) => toast.error(errorMessage(error)) }),
    confirmClose,
    setConfirmClose,
    closeMarks,
    statusPending: status.isPending,
    reopenOpen,
    setReopenOpen: (open: boolean) => {
      setDialogError(null);
      setReopenOpen(open);
    },
    reopenMarks,
    reopening: reopen.isPending,
    dialogError,
    compute: () => {
      setBlocking(null);
      compute.mutate(undefined, { onSuccess: (data) => setJobId(data?.jobId ?? null), onError: showBlocking });
    },
    computing: compute.isPending,
    jobId,
    sendForApproval,
    approving: approve.isPending,
    blocking,
    confirmPublish,
    setConfirmPublish,
    publish: () => publish.mutate(undefined, { onSuccess: () => setConfirmPublish(false) }),
    publishing: publish.isPending,
  };
}
