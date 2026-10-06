"use client";

import { FormDialog } from "@/components/shared/FormDialog";
import { InlineNotice } from "@/components/shared/InlineNotice";
import { SelectField } from "@/components/shared/form/SelectField";
import { TextField } from "@/components/shared/form/TextField";
import { FEE_STATUS_OPTIONS } from "../options";
import { childName } from "../status";
import type { Application } from "../types";
import { useConfirmAdmissionForm } from "../use-confirm-admission-form";
import { AdmissionConfirmedDialog } from "./AdmissionConfirmedDialog";

export function ConfirmAdmissionDialog({ app, onClose }: { app: Application; onClose: () => void }) {
  const confirm = useConfirmAdmissionForm(app);

  if (confirm.studentId) {
    return <AdmissionConfirmedDialog name={childName(app)} studentId={confirm.studentId} onClose={onClose} />;
  }

  return (
    <FormDialog
      open
      onOpenChange={(open) => !open && onClose()}
      title={`Confirm admission of ${childName(app)}`}
      description="Creates the student, guardian accounts and enrollment, and issues an admission number."
      submitLabel="Confirm admission"
      submitting={confirm.submitting}
      onSubmit={confirm.submit}
      form={confirm.form}
      error={confirm.formError}
      size="lg"
    >
      {confirm.noSections && (
        <InlineNotice tone="warning">No active sections for {app.className} in this session. Create one first.</InlineNotice>
      )}
      {confirm.allFull && <InlineNotice tone="warning">Every section of {app.className} is full.</InlineNotice>}
      <div className="grid gap-4 sm:grid-cols-2">
        <SelectField
          name="sectionId"
          label="Section"
          options={confirm.sectionOptions}
          placeholder={confirm.sectionsLoading ? "Loading sections" : "Select"}
          hint="Seats used / capacity."
          required
        />
        <TextField name="admissionDate" label="Admission date" type="date" required />
        <SelectField name="feeStatus" label="Admission fee" options={FEE_STATUS_OPTIONS} required />
        {confirm.paid && (
          <>
            <TextField name="feeAmount" label="Amount received (Rs)" inputMode="decimal" required />
            <TextField name="feeReference" label="Receipt / reference no." className="sm:col-span-2" />
          </>
        )}
      </div>
    </FormDialog>
  );
}
