"use client";

import { FormDialog } from "@/components/shared/FormDialog";
import { CheckboxField } from "@/components/shared/form/CheckboxField";
import { MoneyField } from "@/components/shared/form/MoneyField";
import { MonthField } from "@/components/shared/form/MonthField";
import { SelectField } from "@/components/shared/form/SelectField";
import { TextareaField } from "@/components/shared/form/TextareaField";
import { TextField } from "@/components/shared/form/TextField";
import { UploadField } from "@/features/files/components/UploadField";
import type { Expense } from "../types";
import type { ExpenseLookups } from "../use-expense-lookups";
import { useExpenseForm } from "../use-expense-form";

interface ExpenseFormDialogProps {
  branchId: string;
  lookups: ExpenseLookups;
  onClose: () => void;
  onSaved: (expense: Expense) => void;
}

export function ExpenseFormDialog({ branchId, lookups, onClose, onSaved }: ExpenseFormDialogProps) {
  const expense = useExpenseForm(branchId, onSaved);

  return (
    <FormDialog
      open
      onOpenChange={(open) => !open && onClose()}
      title="Add expense"
      description="Saved as a draft. Submit it for approval before it can be paid."
      submitLabel="Save draft"
      submitting={expense.submitting}
      onSubmit={expense.submit}
      form={expense.form}
      error={expense.formError}
      size="lg"
    >
      <TextField name="title" label="Title" required maxLength={150} placeholder="e.g. Electricity bill" />
      <div className="grid gap-4 sm:grid-cols-2">
        <SelectField name="categoryId" label="Category" options={lookups.categoryOptions} required />
        <SelectField name="vendorId" label="Vendor" options={lookups.vendorOptions} emptyLabel="No vendor" />
        <MoneyField name="amount" label="Amount" required />
        <TextField name="billDate" label="Bill date" type="date" required />
        <TextField name="dueDate" label="Due date" type="date" />
      </div>
      <UploadField name="billFileId" label="Bill copy" purpose="DOCUMENT" />
      <CheckboxField
        name="recurringMonthly"
        label="Repeats every month"
        hint="A new draft is created on the 1st of each month."
      />
      {expense.recurring && (
        <MonthField name="untilMonth" label="Repeat until" hint="Leave empty to repeat until stopped." className="sm:w-1/2" />
      )}
      <TextareaField name="notes" label="Notes" rows={3} />
    </FormDialog>
  );
}
