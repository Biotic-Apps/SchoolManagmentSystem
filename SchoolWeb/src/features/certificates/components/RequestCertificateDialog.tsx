"use client";

import { FormDialog } from "@/components/shared/FormDialog";
import { InlineNotice } from "@/components/shared/InlineNotice";
import { SelectField } from "@/components/shared/form/SelectField";
import { TextareaField } from "@/components/shared/form/TextareaField";
import { TextField } from "@/components/shared/form/TextField";
import { StudentSearchField } from "@/features/students/components/StudentSearchField";
import { CERTIFICATE_TYPE_OPTIONS } from "../options";
import type { Certificate } from "../types";
import { useRequestForm } from "../use-request-form";

interface RequestCertificateDialogProps {
  onClose: () => void;
  onSaved: (certificate: Certificate) => void;
}

export function RequestCertificateDialog({ onClose, onSaved }: RequestCertificateDialogProps) {
  const request = useRequestForm(onSaved);

  return (
    <FormDialog
      open
      onOpenChange={(open) => !open && onClose()}
      title="Request certificate"
      description={request.isParent && request.childName ? `For ${request.childName}` : undefined}
      submitLabel="Send request"
      submitting={request.submitting}
      onSubmit={request.submit}
      form={request.form}
      error={request.formError}
    >
      {!request.isParent && <StudentSearchField name="studentId" required />}
      <SelectField name="type" label="Certificate type" options={CERTIFICATE_TYPE_OPTIONS} required />
      {request.needsClearance && (
        <InlineNotice>Approval needs a clear fee balance and all issued items returned.</InlineNotice>
      )}
      <TextField name="purpose" label="Purpose" maxLength={200} placeholder="e.g. Admission in another school" />
      {request.showAchievement && <TextareaField name="achievement" label="Achievement" required rows={3} />}
    </FormDialog>
  );
}
