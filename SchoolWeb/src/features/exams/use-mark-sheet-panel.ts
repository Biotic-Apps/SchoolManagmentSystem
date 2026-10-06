import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useCan } from "@/features/auth/use-can";
import { ApiError } from "@/lib/api-error";
import { errorMessage } from "@/lib/error-messages";
import { notifyActionResult } from "@/lib/probation";
import { toast } from "@/lib/toast";
import { examsKeys } from "./keys";
import { pendingIdsFromError } from "./mark-validation";
import { useMarkSheet, useReviewMarkSheet, useSaveMarkSheet, useSubmitMarkSheet } from "./marks-api";
import type { Exam } from "./types";
import { useMarkSheetEditor } from "./use-mark-sheet-editor";

const EDITABLE = new Set(["NOT_ENTERED", "DRAFT", "RETURNED"]);

/** One mark sheet: load, enter marks locally, save draft, submit, or review (accept / return). */
export function useMarkSheetPanel(exam: Exam, sheetId: string) {
  const can = useCan();
  const queryClient = useQueryClient();
  const query = useMarkSheet(sheetId);
  const sheet = query.data;
  const editor = useMarkSheetEditor(sheet);
  const save = useSaveMarkSheet(sheetId);
  const submit = useSubmitMarkSheet(sheetId);
  const review = useReviewMarkSheet(sheetId);
  const [flagged, setFlagged] = useState<Set<string>>(new Set());
  const [notice, setNotice] = useState<string | null>(null);
  const [returning, setReturning] = useState(false);

  const canEdit =
    can("exams.edit") && exam.status === "MARKS_OPEN" && !!sheet && EDITABLE.has(sheet.status);
  const canSubmit = canEdit && can("exams.submit");
  const canReview = can("exams.approve") && sheet?.status === "SUBMITTED";

  const flag = (ids: string[], message: string) => {
    setFlagged(new Set(ids));
    setNotice(message);
  };

  const persist = async (): Promise<boolean> => {
    if (editor.hasErrors) {
      flag([], "Fix the highlighted marks before saving.");
      return false;
    }
    try {
      const saved = await save.mutateAsync({ rows: editor.input, clientRequestId: crypto.randomUUID() });
      if (saved?.rows) queryClient.setQueryData(examsKeys.markSheet(sheetId), saved);
      else await query.refetch();
      editor.reset();
      return true;
    } catch (error) {
      flag([], errorMessage(error));
      return false;
    }
  };

  const saveDraft = async () => {
    setNotice(null);
    if (await persist()) toast.success("Draft saved");
  };

  const submitSheet = async () => {
    setNotice(null);
    if (editor.pendingIds.length > 0) {
      flag(editor.pendingIds, "Enter marks or mark Absent for every student before submitting.");
      return;
    }
    if (editor.dirty && !(await persist())) return;
    try {
      const result = await submit.mutateAsync();
      setFlagged(new Set());
      notifyActionResult(result, "Mark sheet submitted");
    } catch (error) {
      const ids = pendingIdsFromError(error);
      if (error instanceof ApiError && error.status === 400 && ids.length > 0) {
        flag(ids, "Some students still have no marks. They are highlighted below.");
      } else toast.error(errorMessage(error));
    }
  };

  return {
    query,
    sheet,
    editor,
    flagged,
    notice,
    canEdit,
    canSubmit,
    canReview,
    saving: save.isPending,
    submitting: submit.isPending,
    reviewing: review.isPending,
    saveDraft,
    submitSheet,
    accept: () => review.mutate({ action: "accept" }),
    returnDialog: { open: returning, setOpen: setReturning },
    returnSheet: (comment: string) =>
      review.mutate({ action: "return", comment }, { onSuccess: () => setReturning(false) }),
  };
}

export type MarkSheetState = ReturnType<typeof useMarkSheetPanel>;
