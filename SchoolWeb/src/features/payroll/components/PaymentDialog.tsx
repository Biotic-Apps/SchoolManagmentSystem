"use client";

import { FormDialog } from "@/components/shared/FormDialog";
import { MoneyText } from "@/components/shared/MoneyText";
import { MoneyField } from "@/components/shared/form/MoneyField";
import { SelectField } from "@/components/shared/form/SelectField";
import { TextField } from "@/components/shared/form/TextField";
import { PAYMENT_METHOD_OPTIONS } from "../options";
import type { PayrollLine } from "../types";
import { usePaymentForm } from "../use-payment-form";

interface PaymentDialogProps {
  runId: string;
  line: PayrollLine;
  onClose: () => void;
}

export function PaymentDialog({ runId, line, onClose }: PaymentDialogProps) {
  const { form, submit, submitting, formError } = usePaymentForm(runId, line, onClose);
  return (
    <FormDialog
      open
      onOpenChange={(open) => !open && onClose()}
      title={`Record payment · ${line.name}`}
      description="Part payments are allowed; the remaining balance stays on the line."
      submitLabel="Record payment"
      submitting={submitting}
      onSubmit={submit}
      form={form}
      error={formError}
    >
      <dl className="grid grid-cols-3 gap-3 rounded-input bg-background px-3 py-2.5">
        {[
          { label: "Net", amount: line.netMinor },
          { label: "Paid", amount: line.paidMinor },
          { label: "Balance", amount: line.balanceMinor },
        ].map((item) => (
          <div key={item.label} className="flex flex-col gap-0.5">
            <dt className="text-caption text-fg-muted">{item.label}</dt>
            <dd className="text-label font-medium text-fg">
              <MoneyText amountMinor={item.amount} />
            </dd>
          </div>
        ))}
      </dl>
      <div className="grid gap-4 sm:grid-cols-2">
        <MoneyField name="amount" label="Amount" required />
        <TextField name="paidOn" label="Paid on" type="date" required />
      </div>
      <SelectField name="method" label="Method" options={PAYMENT_METHOD_OPTIONS} placeholder="Select method" required />
      <TextField name="reference" label="Reference" hint="Bank transaction or cheque number" />
    </FormDialog>
  );
}
