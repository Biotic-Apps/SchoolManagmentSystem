import { useState } from "react";
import { useCan } from "@/features/auth/use-can";
import { errorMessage } from "@/lib/error-messages";
import { toast } from "@/lib/toast";
import { conflictItems, unacceptedSheets, type UnacceptedSheet } from "./conflict-details";
import { useApproveResults, useComputeResults, useExamStatus, usePublishExam } from "./exams-api";
import type { Exam } from "./types";

/** Workflow buttons on the exam overview, gated by permission and status. */
export function useExamStatusActions(exam: Exam) {
  const can = useCan();
  const status = useExamStatus(exam.id);
  const compute = useComputeResults(exam.id);
  const approve = useApproveResults(exam.id);
  const publish = usePublishExam(exam.id);
  const [jobId, setJobId] = useState<string | null>(null);
  const [blocking, setBlocking] = useState<UnacceptedSheet[] | null>(null);
  const [confirmPublish, setConfirmPublish] = useState(false);

  const canEdit = can("exams.edit");
  const canApprove = can("exams.approve");
  const awaitingApproval = exam.status === "MARKS_CLOSED" && !!exam.approvalId;

  const sendForApproval = () => {
    setBlocking(null);
    approve.mutate(undefined, {
      onError: (error) => {
        const items = conflictItems(error);
        if (items && items.length > 0) setBlocking(unacceptedSheets(items));
        else toast.error(errorMessage(error));
      },
    });
  };

  return {
    canOpenMarks: canEdit && exam.status === "SCHEDULED",
    canCloseMarks: canEdit && exam.status === "MARKS_OPEN",
    canCompute: canApprove && exam.status === "MARKS_CLOSED",
    canSendForApproval: canApprove && exam.status === "MARKS_CLOSED" && !awaitingApproval,
    canPublish: can("exams.publish") && exam.status === "RESULTS_APPROVED",
    awaitingApproval,
    openMarks: () => status.mutate({ status: "MARKS_OPEN" }),
    closeMarks: () => status.mutate({ status: "MARKS_CLOSED" }),
    statusPending: status.isPending,
    compute: () => compute.mutate(undefined, { onSuccess: (data) => setJobId(data?.jobId ?? null) }),
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
