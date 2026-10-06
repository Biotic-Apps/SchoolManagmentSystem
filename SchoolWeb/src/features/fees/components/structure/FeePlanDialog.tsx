"use client";

import type { Option } from "@/components/shared/OptionSelect";
import { FormDialog } from "@/components/shared/FormDialog";
import { InlineNotice } from "@/components/shared/InlineNotice";
import { SelectField } from "@/components/shared/form/SelectField";
import { TextField } from "@/components/shared/form/TextField";
import { useFeePlanForm } from "../../use-fee-plan-form";
import type { FeePlan } from "../../types";
import { FeePlanItemsFields } from "./FeePlanItemsFields";
import { FeePlanLateFeeFields } from "./FeePlanLateFeeFields";

interface FeePlanDialogProps {
  plan: FeePlan | null;
  scope: { branchId: string; sessionId: string };
  classOptions: Option[];
  headOptions: Option[];
  onClose: () => void;
}

export function FeePlanDialog({ plan, scope, classOptions, headOptions, onClose }: FeePlanDialogProps) {
  const { form, submit, submitting, formError } = useFeePlanForm(plan, scope, onClose);
  return (
    <FormDialog
      open
      onOpenChange={(open) => !open && onClose()}
      title={plan ? `Edit ${plan.name}` : "New fee plan"}
      description="The fees one class pays in this session."
      submitLabel={plan ? "Save changes" : "Create plan"}
      submitting={submitting}
      onSubmit={submit}
      form={form}
      error={formError}
      size="xl"
    >
      {plan && <InlineNotice>Changes apply to invoices generated after the updated plan is approved.</InlineNotice>}
      <div className="grid gap-4 sm:grid-cols-2">
        <SelectField name="classId" label="Class" options={classOptions} required disabled={!!plan} />
        <TextField name="name" label="Plan name" required placeholder="e.g. Class 5 standard" />
      </div>
      <FeePlanItemsFields headOptions={headOptions} />
      <FeePlanLateFeeFields />
    </FormDialog>
  );
}
