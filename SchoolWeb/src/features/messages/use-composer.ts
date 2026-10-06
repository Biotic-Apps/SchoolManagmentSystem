import { useState, type KeyboardEvent } from "react";
import { useServerForm } from "@/lib/use-server-form";
import { useSendMessage } from "./api";
import { composerDefaults, composerSchema, toSendInput } from "./schemas";
import { notifySendResult } from "./send-result";

/** Reply box of a thread; Ctrl/⌘+Enter sends. */
export function useComposer(threadId: string) {
  const send = useSendMessage(threadId);
  const [resetKey, setResetKey] = useState(0);
  const [silent, setSilent] = useState(false);

  const { form, submit, submitting, formError } = useServerForm({
    schema: composerSchema,
    defaultValues: composerDefaults,
    onSubmit: (values) => send.mutateAsync(toSendInput(values)),
    onSuccess: (result) => {
      notifySendResult(result);
      setSilent(!!result?.deliveredSilently);
      form.reset(composerDefaults);
      setResetKey((key) => key + 1);
    },
  });

  const body = form.watch("body");
  const files = form.watch("attachmentFileIds");
  const canSend = !!body?.trim() || files.length > 0;

  return {
    form,
    submit: canSend ? submit : (event?: { preventDefault: () => void }) => event?.preventDefault(),
    submitting,
    formError,
    canSend,
    silent,
    /** Remounts the attachments field so it clears after a send. */
    resetKey,
    onKeyDown: (event: KeyboardEvent<HTMLTextAreaElement>) => {
      if (event.key === "Enter" && (event.ctrlKey || event.metaKey) && canSend) {
        event.preventDefault();
        void submit();
      }
    },
  };
}
