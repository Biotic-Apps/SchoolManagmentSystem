"use client";

import { FormDialog } from "@/components/shared/FormDialog";
import { MoneyField } from "@/components/shared/form/MoneyField";
import { MonthField } from "@/components/shared/form/MonthField";
import { SelectField } from "@/components/shared/form/SelectField";
import { TextField } from "@/components/shared/form/TextField";
import { TextareaField } from "@/components/shared/form/TextareaField";
import { StudentSearchField } from "@/features/students/components/StudentSearchField";
import { CONCESSION_TYPE_OPTIONS } from "../../concession-options";
import { useConcessionForm } from "../../use-concession-form";

interface ConcessionFormDialogProps {
  branchId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ConcessionFormDialog(props: ConcessionFormDialogProps) {
  if (!props.open) return null;
  return <ConcessionForm {...props} />;
}

function ConcessionForm({ branchId, onOpenChange }: ConcessionFormDialogProps) {
  const concession = useConcessionForm(branchId, () => onOpenChange(false));
  return (
    <FormDialog
      open
      onOpenChange={onOpenChange}
      title="Request concession"
      description="Applies to invoices generated after it is approved."
      submitLabel="Send for approval"
      submitting={concession.submitting}
      onSubmit={concession.submit}
      form={concession.form}
      error={concession.formError}
      size="lg"
    >
      <StudentSearchField name="studentId" branchId={branchId} required />
      <div className="grid gap-4 sm:grid-cols-2">
        <SelectField name="feeHeadId" label="Fee head" options={concession.headOptions} emptyLabel="All heads" />
        <SelectField name="type" label="Type" options={CONCESSION_TYPE_OPTIONS} required />
        {concession.type === "PERCENT" ? (
          <TextField name="percent" label="Percentage" inputMode="numeric" hint="1 to 100" required />
        ) : (
          <MoneyField name="amount" label="Amount per invoice" required />
        )}
        <div className="hidden sm:block" />
        <MonthField name="from" label="From month" required />
        <MonthField name="to" label="To month" hint="Leave empty to keep it running" />
      </div>
      <TextareaField name="reason" label="Reason" required />
    </FormDialog>
  );
}
