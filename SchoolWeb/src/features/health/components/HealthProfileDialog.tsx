"use client";

import { FormDialog } from "@/components/shared/FormDialog";
import { InlineNotice } from "@/components/shared/InlineNotice";
import type { HealthProfile } from "../types";
import { useHealthProfileForm } from "../use-health-profile-form";
import type { HealthEditorMode } from "../use-health-tab";
import { HealthProfileFields } from "./HealthProfileFields";

interface HealthProfileDialogProps {
  studentId: string;
  profile: HealthProfile | null;
  mode: HealthEditorMode;
  onClose: () => void;
}

export function HealthProfileDialog({ studentId, profile, mode, onClose }: HealthProfileDialogProps) {
  const { form, submit, submitting, formError } = useHealthProfileForm(studentId, profile, mode, onClose);
  const isRequest = mode === "request";
  return (
    <FormDialog
      open
      onOpenChange={(open) => !open && onClose()}
      title={isRequest ? "Request a health record change" : "Edit health profile"}
      submitLabel={isRequest ? "Send request" : "Save"}
      submitting={submitting}
      onSubmit={submit}
      form={form}
      error={formError}
      size="xl"
    >
      {isRequest && (
        <InlineNotice>The school office verifies your changes before they appear on the record.</InlineNotice>
      )}
      <HealthProfileFields />
    </FormDialog>
  );
}
