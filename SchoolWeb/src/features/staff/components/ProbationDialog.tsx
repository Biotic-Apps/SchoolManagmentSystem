"use client";

import { FormDialog } from "@/components/shared/FormDialog";
import { InlineNotice } from "@/components/shared/InlineNotice";
import { CheckboxField } from "@/components/shared/form/CheckboxField";
import { SelectField } from "@/components/shared/form/SelectField";
import type { StaffDetail } from "../types";
import { useProbationForm } from "../use-probation-form";

interface ProbationDialogProps {
  staff: StaffDetail;
  branchId: string | null;
  onClose: () => void;
}

export function ProbationDialog({ staff, branchId, onClose }: ProbationDialogProps) {
  const probation = useProbationForm(staff, branchId, onClose);

  return (
    <FormDialog
      open
      onOpenChange={(open) => !open && onClose()}
      title="Probation review"
      description={`While on review, changes ${staff.name} makes (such as attendance, diary entries or marks) wait for the reviewer's approval.`}
      submitLabel="Save"
      submitting={probation.submitting}
      onSubmit={probation.submit}
      form={probation.form}
      error={probation.formError}
    >
      <CheckboxField name="requiresReview" label="Work requires review" />
      {probation.requiresReview && (
        <SelectField
          name="reviewerUserId"
          label="Reviewer"
          options={probation.reviewerOptions}
          placeholder={probation.reviewersLoading ? "Loading reviewers" : "Select"}
          required
          hint="A coordinator, head teacher or principal of the same branch."
        />
      )}
      {probation.requiresReview && probation.noReviewers && (
        <InlineNotice tone="warning">
          No coordinator, head teacher or principal with a sign-in account was found in this branch.
        </InlineNotice>
      )}
    </FormDialog>
  );
}
