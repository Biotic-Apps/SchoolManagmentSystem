"use client";

import { FormDialog } from "@/components/shared/FormDialog";
import { TextField } from "@/components/shared/form/TextField";
import { usePromotionApplyForm } from "../../use-promotion-actions-form";
import type { PromotionsTabState } from "../../use-promotions-tab";

export function ApplyPromotionsDialog({ tab }: { tab: PromotionsTabState }) {
  const { form, submit, submitting, formError } = usePromotionApplyForm(tab);
  const { confirmed } = tab.counts;

  return (
    <FormDialog
      open
      onOpenChange={(open) => !open && tab.dialogs.apply.close()}
      title="Apply promotions"
      description={`${confirmed} confirmed ${confirmed === 1 ? "decision" : "decisions"} will close current enrollments and create next-session enrollments. History is kept.`}
      submitLabel="Apply"
      submitting={submitting}
      onSubmit={submit}
      form={form}
      error={formError}
    >
      <TextField name="effectiveDate" label="Effective date" type="date" required />
    </FormDialog>
  );
}
