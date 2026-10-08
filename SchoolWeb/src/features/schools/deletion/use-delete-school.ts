import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { errorMessage } from "@/lib/error-messages";
import { toast } from "@/lib/toast";
import type { School } from "../types";
import { deletionKeys, useDeletionPreview, useDeletionStatus, useRequestDeletion } from "./api";

/** Confirm-by-code flow for permanently deleting one school (runs as a background job). */
export function useDeleteSchool(school: School, onDeleted: (school: School) => void) {
  const queryClient = useQueryClient();
  const [confirmText, setConfirmText] = useState("");
  const [requested, setRequested] = useState(false);
  const preview = useDeletionPreview(school.id);
  const request = useRequestDeletion();
  const status = useDeletionStatus(school.id, requested);
  const state = requested ? status.data?.state : undefined;
  const done = useRef(false);

  useEffect(() => {
    if (state !== "DELETED" || done.current) return;
    done.current = true;
    toast.success(`${school.name} was deleted permanently`);
    queryClient.removeQueries({ queryKey: ["schools", "detail", school.id] });
    void queryClient.invalidateQueries({ queryKey: ["schools", "list"] });
    void queryClient.invalidateQueries({ queryKey: ["branches"] });
    onDeleted(school);
  }, [state, school, queryClient, onDeleted]);

  const submit = () => {
    if (confirmText.trim() !== school.code) return;
    // A retry after a failure must not read the old run's state.
    setRequested(false);
    queryClient.removeQueries({ queryKey: deletionKeys.status(school.id) });
    request.mutate(
      { id: school.id, confirmCode: confirmText.trim() },
      { onSuccess: () => setRequested(true) },
    );
  };

  const failed = state === "FAILED";
  const running = request.isPending || (requested && !failed && state !== "DELETED");
  const error = request.error
    ? errorMessage(request.error)
    : failed
      ? `Deletion failed, nothing was removed. ${status.data?.error ?? ""}`.trim()
      : null;

  return {
    preview,
    confirmText,
    setConfirmText,
    matches: confirmText.trim() === school.code,
    running,
    error,
    submit,
  };
}
