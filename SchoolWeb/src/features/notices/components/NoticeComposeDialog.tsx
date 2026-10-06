"use client";

import { FormProvider } from "react-hook-form";
import { FormAlert } from "@/components/shared/FormAlert";
import { CheckboxField } from "@/components/shared/form/CheckboxField";
import { TextField } from "@/components/shared/form/TextField";
import { TextareaField } from "@/components/shared/form/TextareaField";
import { Button } from "@/components/ui/Button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/Dialog";
import { AttachmentsField } from "@/features/files/components/AttachmentsField";
import { todayIso } from "@/lib/dates";
import type { Notice } from "../types";
import type { AudienceOptions } from "../use-audience-options";
import { useNoticeForm } from "../use-notice-form";
import { AudienceBuilder } from "./AudienceBuilder";

interface NoticeComposeDialogProps {
  notice: Notice | null;
  branchId: string | null;
  audienceOptions: AudienceOptions;
  canPublish: boolean;
  onClose: () => void;
}

export function NoticeComposeDialog({ notice, branchId, audienceOptions, canPublish, onClose }: NoticeComposeDialogProps) {
  const { form, formError, submitting, saveDraft, saveAndPublish, pendingAction } = useNoticeForm(
    notice,
    branchId,
    onClose,
  );

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>{notice ? "Edit notice" : "Compose notice"}</DialogTitle>
          <DialogDescription>Drafts stay private until published. Recipients are notified on publish.</DialogDescription>
        </DialogHeader>
        <FormProvider {...form}>
          <form
            noValidate
            className="flex flex-col gap-4"
            onSubmit={(event) => {
              event.preventDefault();
              saveDraft();
            }}
          >
            <FormAlert message={formError} />
            <TextField name="title" label="Title" required maxLength={150} />
            <TextareaField name="body" label="Notice" rows={6} required />
            <AudienceBuilder options={audienceOptions} />
            <div className="grid gap-4 sm:grid-cols-2 sm:items-end">
              <TextField name="expiresOn" label="Expires on" type="date" min={todayIso()} hint="Leave empty to keep it up." />
              <div className="sm:pb-3">
                <CheckboxField name="pinned" label="Pin to the top" />
              </div>
            </div>
            <AttachmentsField name="attachmentFileIds" initial={notice?.attachments} />
            <DialogFooter>
              <Button variant="secondary" onClick={onClose} disabled={submitting}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant={canPublish ? "secondary" : "primary"}
                loading={pendingAction === "draft"}
                disabled={submitting}
              >
                {notice ? "Save changes" : "Save draft"}
              </Button>
              {canPublish && (
                <Button loading={pendingAction === "publish"} disabled={submitting} onClick={saveAndPublish}>
                  Save & publish
                </Button>
              )}
            </DialogFooter>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}
