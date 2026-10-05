"use client";

import { FormDialog } from "@/components/shared/FormDialog";
import { CheckboxField } from "@/components/shared/form/CheckboxField";
import { TimeField } from "@/components/shared/form/TimeField";
import type { BranchSettings } from "../types";
import { useBranchSettingsForm } from "../use-branch-settings-form";

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
      description="Rules used by attendance, diary and messaging in this branch."
      submitLabel="Save settings"
      submitting={submitting}
      onSubmit={submit}
      form={form}
      error={formError}
    >
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
    </FormDialog>
  );
}
