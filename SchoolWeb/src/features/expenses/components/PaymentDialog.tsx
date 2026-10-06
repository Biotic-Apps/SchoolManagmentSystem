"use client";

import { FormDialog } from "@/components/shared/FormDialog";
import { MoneyText } from "@/components/shared/MoneyText";
import { MoneyField } from "@/components/shared/form/MoneyField";
import { SelectField } from "@/components/shared/form/SelectField";
import { TextField } from "@/components/shared/form/TextField";
import { EXPENSE_PAYMENT_METHOD_OPTIONS } from "../options";
import { usePaymentForm } from "../use-payment-form";

interface PaymentDialogProps {
  expenseId: string;
  balanceMinor: number;
  onClose: () => void;
}

export function PaymentDialog({ expenseId, balanceMinor, onClose }: PaymentDialogProps) {
  const payment = usePaymentForm(expenseId, balanceMinor, onClose);

  return (
    <FormDialog
      open
      onOpenChange={(open) => !open && onClose()}
      title="Record payment"
      description="Part payments are allowed; the expense is marked paid once the balance is settled."
      submitLabel="Record payment"
      submitting={payment.submitting}
      onSubmit={payment.submit}
      form={payment.form}
      error={payment.formError}
    >
      <p className="text-label text-fg-muted">
        Outstanding balance: <MoneyText amountMinor={balanceMinor} className="font-medium text-fg" />
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        <MoneyField name="amount" label="Amount" required />
        <SelectField name="method" label="Method" options={EXPENSE_PAYMENT_METHOD_OPTIONS} required />
        <TextField name="paidOn" label="Paid on" type="date" required />
        <TextField name="reference" label="Reference" placeholder="Cheque or transaction no." maxLength={100} />
      </div>
    </FormDialog>
  );
}
