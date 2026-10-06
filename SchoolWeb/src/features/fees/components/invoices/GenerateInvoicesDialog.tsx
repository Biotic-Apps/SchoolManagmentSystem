"use client";

import type { Option } from "@/components/shared/OptionSelect";
import { FormDialog } from "@/components/shared/FormDialog";
import { MonthField } from "@/components/shared/form/MonthField";
import { SelectField } from "@/components/shared/form/SelectField";
import { CheckboxListField } from "@/features/notices/components/CheckboxListField";
import { useGenerateInvoicesForm } from "../../use-generate-invoices-form";

interface GenerateInvoicesDialogProps {
  branchId: string;
  sessionId: string | null;
  period: string;
  sessionOptions: Option[];
  classOptions: Option[];
  onStarted: (result: { jobId?: string | null } | null) => void;
  onClose: () => void;
}

export function GenerateInvoicesDialog({
  branchId,
  sessionId,
  period,
  sessionOptions,
  classOptions,
  onStarted,
  onClose,
}: GenerateInvoicesDialogProps) {
  const { form, submit, submitting, formError } = useGenerateInvoicesForm({ branchId, sessionId, period }, (result) => {
    onStarted(result);
    onClose();
  });

  return (
    <FormDialog
      open
      onOpenChange={(open) => !open && onClose()}
      title="Generate invoices"
      description="Creates draft invoices from approved fee plans, with active concessions and late fees. Students already invoiced for the month are skipped."
      submitLabel="Generate"
      submitting={submitting}
      onSubmit={submit}
      form={form}
      error={formError}
      size="lg"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <SelectField name="sessionId" label="Session" options={sessionOptions} required />
        <MonthField name="period" label="Billing month" required />
      </div>
      <CheckboxListField
        name="classIds"
        label="Classes (leave empty for all)"
        options={classOptions}
        emptyText="No classes in this school"
      />
    </FormDialog>
  );
}
