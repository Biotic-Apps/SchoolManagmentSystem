import type { Option } from "@/components/shared/OptionSelect";
import type { InvoiceStatus, InvoiceStudent } from "./types";

export const INVOICE_STATUS_OPTIONS: Option[] = [
  { id: "DRAFT", name: "Draft" },
  { id: "ISSUED", name: "Issued" },
  { id: "PARTIALLY_PAID", name: "Partially paid" },
  { id: "PAID", name: "Paid" },
  { id: "OVERDUE", name: "Overdue" },
  { id: "CANCELLED", name: "Cancelled" },
];

// API: DRAFT cancels at once; ISSUED/OVERDUE without payments go for approval.
const CANCELLABLE: InvoiceStatus[] = ["DRAFT", "ISSUED", "OVERDUE"];
const PAYABLE: InvoiceStatus[] = ["ISSUED", "PARTIALLY_PAID", "OVERDUE"];

export const isCancellable = (status: InvoiceStatus, paidMinor = 0) =>
  CANCELLABLE.includes(status) && paidMinor <= 0;
/** Issued (incl. overdue) invoices are cancelled only through an approval. */
export const cancelNeedsApproval = (status: InvoiceStatus) => status !== "DRAFT";
export const isPayable = (status: InvoiceStatus) => PAYABLE.includes(status);

/** "ADM-0042 · Class 5 A" */
export function studentCaption(student: InvoiceStudent): string {
  const section = [student.className, student.sectionName].filter(Boolean).join(" ");
  return [student.admissionNo, section].filter(Boolean).join(" · ");
}
