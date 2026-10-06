"use client";

import { FormDialog } from "@/components/shared/FormDialog";
import type { SyllabusPlan } from "../types";
import { usePlanEditor, type PlanScope } from "../use-plan-editor";
import { ChapterFields } from "./ChapterFields";

interface PlanEditorDialogProps {
  scope: PlanScope;
  source: SyllabusPlan | null;
  isNewRevision: boolean;
  onClose: () => void;
}

export function PlanEditorDialog({ scope, source, isNewRevision, onClose }: PlanEditorDialogProps) {
  const { form, submit, submitting, formError } = usePlanEditor(scope, source, onClose);
  return (
    <FormDialog
      open
      onOpenChange={(open) => !open && onClose()}
      title={isNewRevision ? "New syllabus plan revision" : "Edit syllabus plan draft"}
      description={
        isNewRevision
          ? "Starts from the approved plan. Progress keeps being tracked on the approved plan until this one is approved."
          : "Chapters and topics are taught in the order listed. Save the draft, then submit it for approval."
      }
      submitLabel="Save draft"
      submitting={submitting}
      onSubmit={submit}
      form={form}
      error={formError}
      size="xl"
    >
      <ChapterFields />
    </FormDialog>
  );
}
