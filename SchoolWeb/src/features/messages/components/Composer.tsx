"use client";

import { SendHorizontal } from "lucide-react";
import { FormProvider } from "react-hook-form";
import { FormAlert } from "@/components/shared/FormAlert";
import { InlineNotice } from "@/components/shared/InlineNotice";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { AttachmentsField } from "@/features/files/components/AttachmentsField";
import { SILENT_DELIVERY_TEXT } from "../send-result";
import { useComposer } from "../use-composer";

export function Composer({ threadId }: { threadId: string }) {
  const composer = useComposer(threadId);
  const { form } = composer;

  return (
    <FormProvider {...form}>
      <form onSubmit={composer.submit} noValidate className="flex flex-col gap-3 border-t border-border p-4">
        <FormAlert message={composer.formError} />
        {composer.silent && <InlineNotice>{SILENT_DELIVERY_TEXT}</InlineNotice>}
        <Textarea
          rows={3}
          placeholder="Write a reply"
          aria-label="Reply"
          onKeyDown={composer.onKeyDown}
          {...form.register("body")}
        />
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <AttachmentsField key={composer.resetKey} name="attachmentFileIds" label="Attach files" max={3} />
          <Button type="submit" loading={composer.submitting} disabled={!composer.canSend} className="self-end">
            <SendHorizontal />
            Send
          </Button>
        </div>
        <p className="text-caption text-fg-muted">
          Messages sent outside office hours are delivered without a notification until the school day starts.
        </p>
      </form>
    </FormProvider>
  );
}
