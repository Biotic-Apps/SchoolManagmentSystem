import { useState } from "react";
import { useCan } from "@/features/auth/use-can";
import { useReviewBookList, useReviewPlan } from "./api";
import type { ReviewStatus } from "./types";

type ReviewDialog = "approve" | "return" | null;

interface Reviewable {
  id: string;
  status: ReviewStatus;
}

/** Submit / approve / return for a book list or syllabus plan revision (same workflow for both). */
export function useReviewActions(kind: "bookList" | "plan", item: Reviewable | null) {
  const can = useCan();
  const bookReview = useReviewBookList();
  const planReview = useReviewPlan();
  const mutation = kind === "plan" ? planReview : bookReview;
  const [dialog, setDialog] = useState<ReviewDialog>(null);

  const status = item?.status;
  const run = (action: "submit" | "approve" | "return", comment?: string) => {
    if (!item) return;
    mutation.mutate({ id: item.id, action, comment: comment || undefined }, { onSuccess: () => setDialog(null) });
  };

  return {
    canSubmit: can("syllabus.edit") && (status === "DRAFT" || status === "RETURNED"),
    canReview: can("syllabus.approve") && status === "SUBMITTED",
    pending: mutation.isPending,
    pendingAction: mutation.isPending ? mutation.variables?.action : undefined,
    dialog,
    submit: () => run("submit"),
    openApprove: () => setDialog("approve"),
    openReturn: () => setDialog("return"),
    closeDialog: () => setDialog(null),
    confirm: (comment: string) => dialog && run(dialog, comment),
  };
}

export type ReviewActions = ReturnType<typeof useReviewActions>;
