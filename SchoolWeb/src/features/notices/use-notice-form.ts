import { useRef, useState } from "react";
import { notifyActionResult } from "@/lib/probation";
import { toast } from "@/lib/toast";
import { useServerForm } from "@/lib/use-server-form";
import { usePublishNotice, useSaveNotice } from "./api";
import { noticeDefaults, noticeSchema, toNoticeInput, type NoticeFormValues } from "./schemas";
import type { Notice } from "./types";

/** Compose / edit a DRAFT notice; "Save & publish" saves first, then publishes. */
export function useNoticeForm(notice: Notice | null, branchId: string | null, onDone: () => void) {
  const save = useSaveNotice();
  const publish = usePublishNotice();
  const publishAfterSave = useRef(false);
  const [lastAction, setLastAction] = useState<"draft" | "publish">("draft");

  const server = useServerForm<NoticeFormValues, Notice>({
    schema: noticeSchema,
    defaultValues: noticeDefaults(notice, branchId),
    onSubmit: (values) => save.mutateAsync({ id: notice?.id, input: toNoticeInput(values) }),
    onSuccess: async (saved) => {
      onDone();
      if (!publishAfterSave.current) {
        toast.success(notice ? "Notice updated" : "Draft saved");
        return;
      }
      try {
        notifyActionResult(await publish.mutateAsync(saved.id), "Notice published");
      } catch {
        toast.error("Saved as a draft, but publishing failed. Try publishing it from the list.");
      }
    },
  });

  const submitWith = (andPublish: boolean) => {
    if (server.submitting) return;
    publishAfterSave.current = andPublish;
    setLastAction(andPublish ? "publish" : "draft");
    void server.submit();
  };

  return {
    ...server,
    saveDraft: () => submitWith(false),
    saveAndPublish: () => submitWith(true),
    pendingAction: server.submitting ? lastAction : null,
  };
}
