import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { studentKeys } from "@/features/students/api";
import type { StudentDetail } from "@/features/students/types";
import { errorMessage } from "@/lib/error-messages";
import { http } from "@/lib/http";
import { useDialogState } from "@/lib/use-dialog-state";
import { useUnlinkGuardian } from "./api";

export interface UnlinkTarget {
  studentId: string;
  studentName: string;
  guardianId: string;
  guardianName: string;
  /** Known on the student page; resolved from the student otherwise. */
  linkId?: string;
}

/** Revokes a guardian–student link with a reason (ReasonDialog). */
export function useUnlink() {
  const queryClient = useQueryClient();
  const unlink = useUnlinkGuardian();
  const target = useDialogState<UnlinkTarget>();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const resolveLinkId = async (item: UnlinkTarget) => {
    if (item.linkId) return item.linkId;
    const student = await queryClient.fetchQuery({
      queryKey: studentKeys.detail(item.studentId),
      queryFn: async () => (await http.get<StudentDetail>(`/students/${item.studentId}`)).data,
    });
    const link = student.guardians.find((row) => row.guardian.id === item.guardianId && row.status !== "REVOKED");
    return link?.id ?? null;
  };

  const show = (item: UnlinkTarget) => {
    setError(null);
    target.show(item);
  };

  const confirm = async (reason: string) => {
    const item = target.item;
    if (!item) return;
    setSubmitting(true);
    setError(null);
    try {
      const linkId = await resolveLinkId(item);
      if (!linkId) {
        setError("This link no longer exists. Refresh and try again.");
        return;
      }
      await unlink.mutateAsync({ studentId: item.studentId, linkId, reason });
      target.close();
    } catch (failure) {
      setError(errorMessage(failure));
    } finally {
      setSubmitting(false);
    }
  };

  return { target, show, confirm, submitting, error };
}

export type Unlink = ReturnType<typeof useUnlink>;
