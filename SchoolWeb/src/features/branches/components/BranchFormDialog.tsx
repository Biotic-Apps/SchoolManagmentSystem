"use client";

import { FormDialog } from "@/components/shared/FormDialog";
import { FormField } from "@/components/shared/FormField";
import { Input } from "@/components/ui/Input";
import { SelectField } from "@/components/shared/form/SelectField";
import { TextField } from "@/components/shared/form/TextField";
import { TimeField } from "@/components/shared/form/TimeField";
import { TextareaField } from "@/components/shared/form/TextareaField";
import { WeekdaysField } from "@/components/shared/form/WeekdaysField";
import { useSchoolOptions } from "@/features/schools/api";
import type { Branch } from "../types";
import { useBranchForm } from "../use-branch-form";

interface BranchFormDialogProps {
  branch: Branch | null;
  defaultSchoolId: string | null;
  onClose: () => void;
}

export function BranchFormDialog({ branch, defaultSchoolId, onClose }: BranchFormDialogProps) {
  const { form, submit, submitting, formError } = useBranchForm(branch, defaultSchoolId, onClose);
  const schools = useSchoolOptions(!branch);

  return (
    <FormDialog
      open
      onOpenChange={(open) => !open && onClose()}
      title={branch ? "Edit branch" : "Add branch"}
      submitLabel={branch ? "Save changes" : "Create branch"}
      submitting={submitting}
      onSubmit={submit}
      form={form}
      error={formError}
      size="lg"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        {branch ? (
          <FormField id="branch-school" label="School">
            <Input id="branch-school" value={branch.schoolName} readOnly />
          </FormField>
        ) : (
          <SelectField name="schoolId" label="School" options={schools.options} required />
        )}
        <TextField
          name="code"
          label="Code"
          required
          readOnly={!!branch}
          inputClassName="uppercase"
          hint={branch ? "The code can't be changed." : "2–12 uppercase letters or digits"}
        />
        <TextField name="name" label="Name" required className="sm:col-span-2" />
        <TextField name="phone" label="Phone" type="tel" />
        <TextField name="email" label="Email" type="email" />
        <TextareaField name="address" label="Address" rows={2} className="sm:col-span-2" />
      </div>
      <fieldset className="grid gap-4 sm:grid-cols-3">
        <legend className="mb-2 text-label font-medium text-fg">Student timings</legend>
        <TimeField name="opensAt" label="School opens" required />
        <TimeField name="closesAt" label="School closes" required />
        <TimeField name="attendanceLockAt" label="Attendance locks at" required />
      </fieldset>
      <fieldset className="grid gap-4 sm:grid-cols-3">
        <legend className="mb-2 text-label font-medium text-fg">Teacher timings</legend>
        <TimeField name="staffArrivesAt" label="Teachers arrive" required hint="At or before school opens" />
        <TimeField name="staffLeavesAt" label="Teachers leave" required hint="At or after school closes" />
      </fieldset>
      <WeekdaysField name="workingDays" label="Working days" required />
    </FormDialog>
  );
}
