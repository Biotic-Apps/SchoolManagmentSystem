import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useSession } from "@/features/auth/session-context";
import { useCan } from "@/features/auth/use-can";
import { useHealthAlerts } from "@/features/health/alerts-api";
import { errorMessage } from "@/lib/error-messages";
import { notifyActionResult } from "@/lib/probation";
import { toast } from "@/lib/toast";
import { attendanceKeys, useRegister, useSaveRegister, useSubmitRegister } from "./api";
import { isAlreadySubmitted, isNonWorkingDay, isRecordLocked, registerFromConflict } from "./register-errors";
import type { Register } from "./types";
import { useRegisterEditor } from "./use-register-editor";

const EDITABLE = new Set(["UNMARKED", "DRAFT"]);

/** Register for one section and day: load, mark locally, save draft or submit. */
export function useRegisterTab(sectionId: string | null, date: string) {
  const can = useCan();
  const isHelper = useSession().session?.activeRole === "HELPER";
  const queryClient = useQueryClient();
  const query = useRegister(sectionId, date);
  const register = query.data;
  const editor = useRegisterEditor(register);
  const alerts = useHealthAlerts(sectionId);
  const save = useSaveRegister();
  const submit = useSubmitRegister();
  const [notice, setNotice] = useState<string | null>(null);

  const status = register?.status;
  const canEdit = can("attendance.edit") && !!status && EDITABLE.has(status);
  const canSubmit = canEdit && can("attendance.submit") && !isHelper;
  const queryKey = attendanceKeys.register(sectionId, date);

  const handleError = (error: unknown) => {
    if (isAlreadySubmitted(error)) {
      const current = registerFromConflict(error);
      if (current) queryClient.setQueryData<Register>(queryKey, current);
      else void query.refetch();
      setNotice("Someone else submitted this register while you were marking it. Their version is shown below.");
      return;
    }
    if (isRecordLocked(error)) {
      void query.refetch();
      setNotice("This register is locked. Use “Request correction” on a student to change a mark.");
      return;
    }
    toast.error(errorMessage(error));
  };

  const input = () => ({ sectionId: sectionId ?? "", date, entries: editor.entries });

  const saveDraft = () => {
    setNotice(null);
    save.mutate(input(), {
      onSuccess: (saved) => {
        if (saved) queryClient.setQueryData(queryKey, saved);
        else void query.refetch();
        editor.reset();
      },
      onError: handleError,
    });
  };

  const submitRegister = () => {
    setNotice(null);
    submit.mutate(input(), {
      onSuccess: (result) => {
        notifyActionResult(result, "Attendance submitted");
        editor.reset();
        void queryClient.invalidateQueries({ queryKey });
      },
      onError: handleError,
    });
  };

  return {
    query,
    register,
    editor,
    alerts: alerts.data ?? [],
    nonWorkingDay: isNonWorkingDay(query.error),
    notice,
    canEdit,
    canSubmit,
    isHelper,
    canCorrect: can("attendance.edit") && status === "LOCKED",
    saveDraft,
    submitRegister,
    saving: save.isPending,
    submitting: submit.isPending,
  };
}

export type RegisterTabState = ReturnType<typeof useRegisterTab>;
