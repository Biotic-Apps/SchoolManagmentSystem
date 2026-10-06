"use client";

import type { Option } from "@/components/shared/OptionSelect";
import { FormDialog } from "@/components/shared/FormDialog";
import { CheckboxField } from "@/components/shared/form/CheckboxField";
import { SelectField } from "@/components/shared/form/SelectField";
import { TextField } from "@/components/shared/form/TextField";
import { ASSIGNMENT_KIND_OPTIONS } from "../options";
import { useAssignmentForm } from "../use-assignment-form";

interface AssignmentFormDialogProps {
  staffId: string;
  branchId: string;
  sessionId: string | null;
  sessionOptions: Option[];
  onClose: () => void;
}

export function AssignmentFormDialog({ staffId, branchId, sessionId, sessionOptions, onClose }: AssignmentFormDialogProps) {
  const f = useAssignmentForm({ staffId, branchId, sessionId }, onClose);

  return (
    <FormDialog
      open
      onOpenChange={(open) => !open && onClose()}
      title="Add assignment"
      submitLabel="Add assignment"
      submitting={f.submitting}
      onSubmit={f.submit}
      form={f.form}
      error={f.formError}
      size="lg"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <SelectField name="kind" label="Assignment type" options={ASSIGNMENT_KIND_OPTIONS} required />
        <SelectField name="sessionId" label="Session" options={sessionOptions} required />
        {f.showSection && (
          <SelectField
            name="sectionId"
            label="Class section"
            options={f.sectionOptions}
            required={f.sectionRequired}
            emptyLabel={f.sectionRequired ? undefined : "Whole branch"}
            placeholder={f.sectionsLoading ? "Loading sections" : "Select"}
            hint={f.sectionRequired ? undefined : "Leave as whole branch to supervise every section."}
          />
        )}
        {f.showSubject && (
          <SelectField
            name="subjectId"
            label="Subject"
            options={f.subjectOptions}
            required
            disabled={f.subjectDisabled}
            placeholder={f.subjectsLoading ? "Loading subjects" : "Select"}
            hint={f.subjectDisabled ? "Choose a section first." : undefined}
          />
        )}
        {f.showResponsible && (
          <SelectField
            name="responsibleStaffId"
            label="Responsible teacher"
            options={f.teacherOptions}
            emptyLabel="None"
            hint="The teacher this helper works under."
          />
        )}
      </div>
      <CheckboxField
        name="isSubstitute"
        label="Substitute assignment"
        hint="Temporary cover; it ends automatically after the last day."
      />
      {f.showValidUntil && <TextField name="validUntil" label="Last day" type="date" required className="sm:w-1/2" />}
    </FormDialog>
  );
}
