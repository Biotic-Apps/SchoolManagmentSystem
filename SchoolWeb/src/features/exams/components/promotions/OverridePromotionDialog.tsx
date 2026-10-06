"use client";

import { FormDialog } from "@/components/shared/FormDialog";
import { InlineNotice } from "@/components/shared/InlineNotice";
import { SelectField } from "@/components/shared/form/SelectField";
import { TextareaField } from "@/components/shared/form/TextareaField";
import { DECISION_LABEL, DECISION_OPTIONS } from "../../promotion-options";
import type { PromotionRow } from "../../types";
import { usePromotionOverrideForm } from "../../use-promotion-override-form";

interface OverridePromotionDialogProps {
  row: PromotionRow;
  branchId: string | null;
  toSessionId: string | null;
  onClose: () => void;
}

export function OverridePromotionDialog({ row, branchId, toSessionId, onClose }: OverridePromotionDialogProps) {
  const override = usePromotionOverrideForm(row, branchId, toSessionId, onClose);

  return (
    <FormDialog
      open
      onOpenChange={(open) => !open && onClose()}
      title={`Decision for ${row.student.name}`}
      description={`Suggested: ${DECISION_LABEL[row.suggested]}${typeof row.percent === "number" ? ` (${row.percent.toFixed(1)}%)` : ""}.`}
      submitLabel="Save decision"
      submitting={override.submitting}
      onSubmit={override.submit}
      form={override.form}
      error={override.formError}
    >
      <SelectField name="decision" label="Decision" options={DECISION_OPTIONS} required />
      {override.showSection &&
        (override.hasToSession ? (
          <SelectField
            name="toSectionId"
            label="Section next session"
            options={override.sectionOptions}
            placeholder={override.sectionsLoading ? "Loading sections…" : "Choose a section"}
            emptyLabel="Decide later"
          />
        ) : (
          <InlineNotice tone="warning">Choose the session students move into to pick a section.</InlineNotice>
        ))}
      <TextareaField
        name="reason"
        label="Reason"
        required={override.reasonRequired}
        hint={override.reasonRequired ? "Required when the decision differs from the suggestion." : undefined}
        rows={3}
      />
    </FormDialog>
  );
}
