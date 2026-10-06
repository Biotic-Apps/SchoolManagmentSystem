import { useEffect, useState } from "react";
import { useWatch } from "react-hook-form";
import { hasErrorCode } from "@/lib/api-error";
import { errorMessage } from "@/lib/error-messages";
import { toMinor, toMoneyText } from "@/lib/money";
import { useServerForm } from "@/lib/use-server-form";
import { allocateOldestFirst, orderForAllocation } from "./payment-allocation";
import { manualTotal, paymentDefaults, paymentSchema, toPaymentInput, type PaymentFormValues } from "./payment-schemas";
import { useOpenInvoices, useRecordPayment } from "./payments-api";
import type { Payment } from "./types";

interface PaymentFormOptions {
  studentId?: string;
  invoiceId?: string;
}

/** Record a counter payment: live allocation preview (oldest due first) or manual split. */
export function usePaymentForm({ studentId: fixedStudentId, invoiceId }: PaymentFormOptions) {
  // One id per dialog, so a retried submit can never create a second payment.
  const [clientRequestId] = useState(() => crypto.randomUUID());
  const [recorded, setRecorded] = useState<Payment | null>(null);
  const record = useRecordPayment();

  const { form, submit, submitting, formError } = useServerForm<PaymentFormValues, Payment | null>({
    schema: paymentSchema,
    defaultValues: paymentDefaults(fixedStudentId),
    onSubmit: async (values) => {
      const overBalance = values.manual ? firstOverBalance(values) : -1;
      if (overBalance >= 0) {
        form.setError(`allocations.${overBalance}.amount`, { message: "More than this invoice's balance" });
        return null;
      }
      try {
        return await record.mutateAsync(toPaymentInput(values, clientRequestId, allocationsFor(values)));
      } catch (error) {
        if (!hasErrorCode(error, "DAY_CLOSED")) throw error;
        form.setError("receivedOn", { message: errorMessage(error) });
        return null;
      }
    },
    onSuccess: (payment) => payment && setRecorded(payment),
  });

  const [studentId, amount, method, manual, allocations] = useWatch({
    control: form.control,
    name: ["studentId", "amount", "method", "manual", "allocations"],
  });
  const invoicesQuery = useOpenInvoices(studentId || null);
  const invoices = orderForAllocation(invoicesQuery.data ?? [], invoiceId);
  const amountMinor = toMinor(amount) ?? 0;
  const preview = allocateOldestFirst(invoices, amountMinor, invoiceId);
  const manualMinor = manualTotal(allocations);

  // A different student has different invoices: start the split again.
  useEffect(() => {
    form.setValue("manual", false);
    form.setValue("allocations", []);
  }, [studentId, form]);

  function firstOverBalance(values: PaymentFormValues): number {
    return values.allocations.findIndex((row) => {
      const invoice = invoices.find((item) => item.id === row.invoiceId);
      return !!invoice && (toMinor(row.amount) ?? 0) > invoice.balanceMinor;
    });
  }

  function allocationsFor(values: PaymentFormValues) {
    if (values.manual) {
      return values.allocations.map((row) => ({ invoiceId: row.invoiceId, amountMinor: toMinor(row.amount) ?? 0 }));
    }
    if (!invoiceId) return undefined;
    return preview.rows.map((row) => ({ invoiceId: row.invoice.id, amountMinor: row.allocatedMinor }));
  }

  const setManual = (next: boolean) => {
    form.setValue("manual", next);
    form.setValue(
      "allocations",
      next ? preview.rows.map((row) => ({ invoiceId: row.invoice.id, amount: toMoneyText(row.allocatedMinor || null) })) : [],
    );
  };

  return {
    form,
    submit,
    submitting,
    formError,
    recorded,
    method,
    manual,
    setManual,
    invoices,
    invoicesQuery,
    preview,
    amountMinor,
    allocatedMinor: manual ? manualMinor : preview.allocatedMinor,
    advanceMinor: Math.max(0, amountMinor - (manual ? manualMinor : preview.allocatedMinor)),
    hasStudent: !!studentId,
  };
}

export type PaymentForm = ReturnType<typeof usePaymentForm>;
