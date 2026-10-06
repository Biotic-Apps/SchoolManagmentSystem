"use client";

import { FormDialog } from "@/components/shared/FormDialog";
import { TextField } from "@/components/shared/form/TextField";
import { StudentSearchField } from "@/features/students/components/StudentSearchField";
import { useInvoiceForm } from "../../use-invoice-form";
import type { Invoice } from "../../types";
import { InvoiceLinesFields } from "./InvoiceLinesFields";

interface InvoiceFormDialogProps {
  branchId: string;
  schoolId: string | null;
  onCreated: (invoice: Invoice) => void;
  onClose: () => void;
}

export function InvoiceFormDialog({ branchId, schoolId, onCreated, onClose }: InvoiceFormDialogProps) {
  const { form, submit, submitting, formError } = useInvoiceForm((invoice) => {
    onClose();
    if (invoice?.id) onCreated(invoice);
  });

  return (
    <FormDialog
      open
      onOpenChange={(open) => !open && onClose()}
      title="New invoice"
      description="A one-off invoice for a single student, saved as a draft."
      submitLabel="Create draft"
      submitting={submitting}
      onSubmit={submit}
      form={form}
      error={formError}
      size="xl"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <StudentSearchField name="studentId" required branchId={branchId} />
        <TextField name="dueDate" label="Due date" type="date" required />
      </div>
      <InvoiceLinesFields schoolId={schoolId} />
    </FormDialog>
  );
}
