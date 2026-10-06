"use client";

import { FormDialog } from "@/components/shared/FormDialog";
import { SelectField } from "@/components/shared/form/SelectField";
import { usePromotionConfirmForm } from "../../use-promotion-actions-form";
import type { PromotionsTabState } from "../../use-promotions-tab";

export function ConfirmPromotionsDialog({ tab }: { tab: PromotionsTabState }) {
  const { form, submit, submitting, formError } = usePromotionConfirmForm(tab);

  return (
    <FormDialog
      open
      onOpenChange={(open) => !open && tab.dialogs.confirm.close()}
      title="Confirm for approval"
      description="The current decisions are locked and sent as a promotion approval. They can be applied once it is approved."
      submitLabel="Send for approval"
      submitting={submitting}
      onSubmit={submit}
      form={form}
      error={formError}
    >
      <SelectField
        name="classId"
        label="Class"
        options={tab.scope.classes.options}
        emptyLabel="All classes"
        placeholder="All classes"
      />
    </FormDialog>
  );
}
