"use client";

import { FormDialog } from "@/components/shared/FormDialog";
import { MoneyField } from "@/components/shared/form/MoneyField";
import { SelectField } from "@/components/shared/form/SelectField";
import { TextareaField } from "@/components/shared/form/TextareaField";
import { TextField } from "@/components/shared/form/TextField";
import { UploadField } from "@/features/files/components/UploadField";
import type { Income } from "../types";
import type { IncomeLookups } from "../use-income-lookups";
import { useIncomeForm } from "../use-income-form";

interface IncomeFormDialogProps {
  branchId: string;
  lookups: IncomeLookups;
  onClose: () => void;
  onSaved: (income: Income) => void;
}

export function IncomeFormDialog({ branchId, lookups, onClose, onSaved }: IncomeFormDialogProps) {
  const income = useIncomeForm(branchId, onSaved);

  return (
    <FormDialog
      open
      onOpenChange={(open) => !open && onClose()}
      title="Record income"
      description="Track donations, rent, event fees and other non-fee income."
      submitLabel="Save"
      submitting={income.submitting}
      onSubmit={income.submit}
      form={income.form}
      error={income.formError}
      size="lg"
    >
      <TextField name="title" label="Title" required maxLength={150} placeholder="e.g. Hall rental" />
      <div className="grid gap-4 sm:grid-cols-2">
        <SelectField name="categoryId" label="Category" options={lookups.categoryOptions} required />
        <MoneyField name="amount" label="Amount" required />
        <TextField name="receivedOn" label="Date received" type="date" required />
      </div>
      <TextField name="description" label="Description" maxLength={500} placeholder="Brief description of this income" />
      <UploadField name="receiptFileId" label="Receipt" purpose="DOCUMENT" />
      <TextareaField name="notes" label="Notes" rows={3} />
    </FormDialog>
  );
}
