"use client";

import { FormDialog } from "@/components/shared/FormDialog";
import { MoneyText } from "@/components/shared/MoneyText";
import { MoneyField } from "@/components/shared/form/MoneyField";
import { SelectField } from "@/components/shared/form/SelectField";
import { TextareaField } from "@/components/shared/form/TextareaField";
import { REFUND_METHOD_OPTIONS } from "../../payment-options";
import type { Payment } from "../../types";
import { useRefundForm } from "../../use-refund-form";

interface RefundDialogProps {
  payment: Payment | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RefundDialog({ payment, open, onOpenChange }: RefundDialogProps) {
  if (!payment || !open) return null;
  return <RefundForm key={payment.id} payment={payment} onOpenChange={onOpenChange} />;
}

function RefundForm({ payment, onOpenChange }: { payment: Payment; onOpenChange: (open: boolean) => void }) {
  const refund = useRefundForm(payment, () => onOpenChange(false));
  return (
    <FormDialog
      open
      onOpenChange={onOpenChange}
      title={`Refund ${payment.receiptNo}`}
      description="The refund is paid out only after it is approved."
      submitLabel="Send for approval"
      submitting={refund.submitting}
      onSubmit={refund.submit}
      form={refund.form}
      error={refund.formError}
    >
      <p className="text-label text-fg-muted">
        Payment amount <MoneyText amountMinor={payment.amountMinor} currency={payment.currency} className="font-medium text-fg" />
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        <MoneyField name="amount" label="Refund amount" required />
        <SelectField name="method" label="Paid back by" options={REFUND_METHOD_OPTIONS} required />
      </div>
      <TextareaField name="reason" label="Reason" required />
    </FormDialog>
  );
}
