"use client";

import { FormDialog } from "@/components/shared/FormDialog";
import { SelectField } from "@/components/shared/form/SelectField";
import { MoneyField } from "@/components/shared/form/MoneyField";
import { TextField } from "@/components/shared/form/TextField";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/Dialog";
import { Label } from "@/components/ui/Label";
import { StudentSearchField } from "@/features/students/components/StudentSearchField";
import { todayIso } from "@/lib/dates";
import { PAYMENT_METHOD_OPTIONS, REFERENCE_METHODS } from "../../payment-options";
import { usePaymentForm } from "../../use-payment-form";
import { PaymentAllocationPreview } from "./PaymentAllocationPreview";
import { PaymentRecordedView } from "./PaymentRecordedView";

interface RecordPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  student?: { id: string; name: string } | null;
  invoiceId?: string;
}

export function RecordPaymentDialog(props: RecordPaymentDialogProps) {
  // Mounted only while open, so every payment starts from a clean form and a new request id.
  if (!props.open) return null;
  return <RecordPaymentForm {...props} />;
}

function RecordPaymentForm({ open, onOpenChange, student, invoiceId }: RecordPaymentDialogProps) {
  const payment = usePaymentForm({ studentId: student?.id, invoiceId });

  if (payment.recorded) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Payment recorded</DialogTitle>
          </DialogHeader>
          <PaymentRecordedView payment={payment.recorded} onClose={() => onOpenChange(false)} />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Record payment"
      description="Counter payment against the student's open invoices. A receipt is issued on save."
      submitLabel="Record payment"
      submitting={payment.submitting}
      onSubmit={payment.submit}
      form={payment.form}
      error={payment.formError}
      size="lg"
    >
      {student ? (
        <div className="flex flex-col gap-1.5">
          <Label>Student</Label>
          <span className="text-body font-medium text-fg">{student.name}</span>
        </div>
      ) : (
        <StudentSearchField name="studentId" required />
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        <MoneyField name="amount" label="Amount" required />
        <SelectField name="method" label="Method" options={PAYMENT_METHOD_OPTIONS} required />
        <TextField
          name="reference"
          label="Reference"
          required={REFERENCE_METHODS.has(payment.method)}
          hint="Bank transaction or cheque number"
        />
        <TextField name="receivedOn" label="Received on" type="date" max={todayIso()} required />
      </div>
      <PaymentAllocationPreview payment={payment} />
    </FormDialog>
  );
}
