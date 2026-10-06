import { useEffect, useState } from "react";
import type { Option } from "@/components/shared/OptionSelect";
import { useSession } from "@/features/auth/session-context";
import { useActiveChild, useIsParent } from "@/features/auth/use-active-child";
import { ApiError } from "@/lib/api-error";
import { useServerForm } from "@/lib/use-server-form";
import { useCreateThread } from "./api";
import { classLabel } from "./format";
import { newThreadDefaults, newThreadSchema, toNewThreadInput } from "./schemas";
import { notifySendResult } from "./send-result";
import { recipientOptions, useMessageRecipients } from "./recipients";

const TARGET_DENIED = "You can't message this person";

export function useNewThreadForm(onCreated: (threadId: string) => void) {
  const { session } = useSession();
  const isParent = useIsParent();
  const child = useActiveChild();
  const create = useCreateThread();
  const [targetError, setTargetError] = useState<string | null>(null);

  const { form, submit, submitting, formError } = useServerForm({
    schema: newThreadSchema,
    defaultValues: newThreadDefaults(child?.id),
    onSubmit: async (values) => {
      setTargetError(null);
      try {
        return await create.mutateAsync(toNewThreadInput(values));
      } catch (error) {
        if (error instanceof ApiError && error.status === 403) {
          setTargetError(TARGET_DENIED);
          return null;
        }
        throw error;
      }
    },
    onSuccess: (thread) => {
      if (!thread) return;
      notifySendResult(thread);
      onCreated(thread.id);
    },
  });

  const studentId = form.watch("studentId");
  // A different child has different teachers.
  useEffect(() => form.setValue("staffUserId", ""), [studentId, form]);
  const recipients = useMessageRecipients(isParent && studentId ? studentId : null);

  const childOptions: Option[] = (session?.children ?? []).map((item) => {
    const label = classLabel(item.className, item.sectionName);
    return { id: item.id, name: label ? `${item.name} · ${label}` : item.name };
  });

  return {
    form,
    submit,
    submitting,
    error: targetError ?? formError,
    isParent,
    childOptions,
    staffOptions: recipientOptions(recipients.data),
    staffLoading: recipients.isLoading,
  };
}
