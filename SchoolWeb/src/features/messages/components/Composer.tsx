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
      <form onSubmit={composer.submit} noValidate className="flex flex-col gap-2 border-t border-border bg-surface p-3">
        <FormAlert message={composer.formError} />
        {composer.silent && <InlineNotice>{SILENT_DELIVERY_TEXT}</InlineNotice>}
        <div className="flex items-end gap-2">
          <Textarea
            rows={2}
            placeholder="Write a reply..."
            aria-label="Reply"
            onKeyDown={composer.onKeyDown}
            className="rounded-xl"
            {...form.register("body")}
          />
          <Button
            type="submit"
            loading={composer.submitting}
            disabled={!composer.canSend}
            className="h-10 w-10 shrink-0 rounded-full bg-primary p-0 text-on-primary"
          >
            <SendHorizontal className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center justify-between">
          <AttachmentsField key={composer.resetKey} name="attachmentFileIds" label="Attach files" max={3} />
        </div>
        <p className="text-xs text-fg-muted/70">
          Messages sent outside office hours are delivered without a notification until the school day starts.
        </p>
      </form>
    </FormProvider>
  );
}
