"use client";

import { FormDialog } from "@/components/shared/FormDialog";
import { FormSection } from "@/components/shared/FormSection";
import { CheckboxField } from "@/components/shared/form/CheckboxField";
import { TimeField } from "@/components/shared/form/TimeField";
import type { BranchSettings } from "../types";
import { useBranchSettingsForm } from "../use-branch-settings-form";
import { BranchBankFields } from "./BranchBankFields";

interface BranchSettingsFormProps {
  branchId: string;
  branchName: string;
  settings: BranchSettings;
  onClose: () => void;
}

export function BranchSettingsForm({ branchId, branchName, settings, onClose }: BranchSettingsFormProps) {
  const { form, submit, submitting, formError } = useBranchSettingsForm(branchId, settings, onClose);

  return (
    <FormDialog
      open
      onOpenChange={(open) => !open && onClose()}
      title={`Settings — ${branchName}`}
      description="Rules used by attendance, diary and messaging, and the bank details printed on fee challans."
      submitLabel="Save settings"
      submitting={submitting}
      onSubmit={submit}
      form={form}
      error={formError}
    >
      <FormSection title="Daily rules">
        <TimeField
          name="attendanceLockTime"
          label="Attendance locks at"
          hint="After this time attendance changes need a correction request."
          required
        />
        <CheckboxField
          name="diaryModeration"
          label="Moderate diary entries"
          hint="Teachers' diary entries wait for approval before parents see them."
        />
        <TimeField name="diaryClosingTime" label="Diary closes at" required />
        <div className="grid gap-4 sm:grid-cols-2">
          <TimeField name="officeFrom" label="Office hours from" required />
          <TimeField name="officeTo" label="Office hours to" required />
        </div>
      </FormSection>
      <BranchBankFields />
    </FormDialog>
  );
}
