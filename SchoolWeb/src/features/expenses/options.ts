import type { Option } from "@/components/shared/OptionSelect";

export const EXPENSE_STATUS_OPTIONS: Option[] = [
  { id: "DRAFT", name: "Draft" },
  { id: "SUBMITTED", name: "Submitted" },
  { id: "APPROVED", name: "Approved" },
  { id: "REJECTED", name: "Rejected" },
  { id: "PARTIALLY_PAID", name: "Partially paid" },
  { id: "PAID", name: "Paid" },
];

export const EXPENSE_PAYMENT_METHOD_OPTIONS: Option[] = [
  { id: "CASH", name: "Cash" },
  { id: "BANK", name: "Bank transfer" },
  { id: "CHEQUE", name: "Cheque" },
];

/** Expenses that can take a payment. */
export const PAYABLE_STATUSES = new Set(["APPROVED", "PARTIALLY_PAID"]);

export function methodLabel(id: string): string {
  return EXPENSE_PAYMENT_METHOD_OPTIONS.find((option) => option.id === id)?.name ?? id;
}
