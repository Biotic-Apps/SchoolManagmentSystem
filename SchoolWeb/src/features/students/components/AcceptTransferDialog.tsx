"use client";

import { FormDialog } from "@/components/shared/FormDialog";
import { InlineNotice } from "@/components/shared/InlineNotice";
import { SelectField } from "@/components/shared/form/SelectField";
import { formatDate } from "@/lib/format";
import type { Transfer } from "../types";
import { useAcceptTransferForm } from "../use-accept-transfer-form";

interface AcceptTransferDialogProps {
  transfer: Transfer;
  branchId: string;
  sessionId: string;
  onClose: () => void;
}

export function AcceptTransferDialog({ transfer, branchId, sessionId, onClose }: AcceptTransferDialogProps) {
  const { form, submit, submitting, formError, sections, sectionFull } = useAcceptTransferForm(
    transfer,
    branchId,
    sessionId,
    onClose,
  );

  return (
    <FormDialog
      open
      onOpenChange={(open) => !open && onClose()}
      title={`Accept ${transfer.student.name}`}
      description={`From ${transfer.fromBranch.name}, effective ${formatDate(transfer.effectiveDate)}. Choose the section to place the student in.`}
      submitLabel="Accept and place"
      submitting={submitting}
      onSubmit={submit}
      form={form}
      error={formError}
    >
      <SelectField
        name="sectionId"
        label="Section"
        options={sections.options}
        placeholder={sections.isLoading ? "Loading sections" : "Select"}
        required
      />
      {sectionFull && <InlineNotice tone="warning">This section is at capacity.</InlineNotice>}
    </FormDialog>
  );
}
