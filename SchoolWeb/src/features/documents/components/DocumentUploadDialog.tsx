"use client";

import { FormDialog } from "@/components/shared/FormDialog";
import { SelectField } from "@/components/shared/form/SelectField";
import { TextField } from "@/components/shared/form/TextField";
import { UploadField } from "@/features/files/components/UploadField";
import { DOC_TYPE_OPTIONS } from "../options";
import type { DocumentOwnerType } from "../types";
import { useDocumentUploadForm } from "../use-document-upload-form";

interface DocumentUploadDialogProps {
  ownerType: DocumentOwnerType;
  ownerId: string;
  onClose: () => void;
}

export function DocumentUploadDialog({ ownerType, ownerId, onClose }: DocumentUploadDialogProps) {
  const { form, submit, submitting, formError } = useDocumentUploadForm(ownerType, ownerId, onClose);
  return (
    <FormDialog
      open
      onOpenChange={(open) => !open && onClose()}
      title="Upload document"
      submitLabel="Upload"
      submitting={submitting}
      onSubmit={submit}
      form={form}
      error={formError}
    >
      <SelectField name="docType" label="Document type" options={DOC_TYPE_OPTIONS} required />
      <UploadField name="fileId" label="File" purpose="DOCUMENT" required />
      <TextField name="note" label="Note" placeholder="Optional" />
    </FormDialog>
  );
}
