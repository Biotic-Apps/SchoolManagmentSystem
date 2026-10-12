import type { PersonRef } from "@/features/people/types";

// phase4-contract §B. Money is always integer minor units.

export type FeeHeadKind = "RECURRING" | "ONE_TIME";
export type FeeFrequency = "MONTHLY" | "QUARTERLY" | "TERM" | "YEARLY" | "ONCE";
export type InvoiceStatus = "DRAFT" | "ISSUED" | "PARTIALLY_PAID" | "PAID" | "OVERDUE" | "CANCELLED";
export type PaymentMethod = "CASH" | "BANK" | "CHEQUE" | "ONLINE";
export type ProofMethod = "BANK" | "WALLET" | "OTHER";
export type ProofStatus = "SUBMITTED" | "VERIFIED" | "REJECTED";
export type ConcessionType = "PERCENT" | "FIXED";

export interface FeeHead {
  id: string;
  schoolId: string;
  code: string;
  name: string;
  kind: FeeHeadKind;
  refundable: boolean;
}

export interface FeePlanItem {
  feeHeadId: string;
  feeHead?: PersonRef;
  amountMinor: number;
  frequency: FeeFrequency;
  dueDay: number;
}

export interface FeePlan {
  id: string;
  branchId: string;
  sessionId: string;
  classId: string;
  className?: string;
  name: string;
  status: string;
  items: FeePlanItem[];
  lateFee: { amountMinor: number; afterDays: number } | null;
  approvalId?: string | null;
}

export interface FeePlanInput {
  branchId: string;
  sessionId: string;
  classId: string;
  name: string;
  items: { feeHeadId: string; amountMinor: number; frequency: FeeFrequency; dueDay: number }[];
  lateFee: { amountMinor: number; afterDays: number } | null;
}

export interface InvoiceStudent {
  id: string;
  name: string;
  admissionNo: string;
  className: string | null;
  sectionName: string | null;
}

export interface InvoiceLine {
  id: string;
  feeHead: PersonRef;
  description: string;
  amountMinor: number;
}

export interface InvoicePayment {
  paymentId: string;
  receiptNo: string;
  amountMinor: number;
  paidOn: string;
}

export interface Invoice {
  id: string;
  invoiceNo: string;
  student: InvoiceStudent;
  period: string | null;
  issueDate: string | null;
  dueDate: string;
  status: InvoiceStatus;
  lines: InvoiceLine[];
  concessionMinor: number;
  siblingDiscountMinor: number;
  lateFeeMinor: number;
  totalMinor: number;
  paidMinor: number;
  balanceMinor: number;
  payments: InvoicePayment[];
  currency: string;
}

export interface Payment {
  id: string;
  receiptNo: string;
  student: InvoiceStudent | PersonRef;
  amountMinor: number;
  method: PaymentMethod;
  reference: string | null;
  receivedOn: string;
  status: string;
  cashier?: PersonRef | null;
  allocations?: { invoiceId: string; invoiceNo?: string; amountMinor: number }[];
  advanceMinor?: number;
  receiptUrl?: string | null;
  currency?: string;
}

export interface PaymentProof {
  id: string;
  invoiceId: string;
  invoiceNo?: string;
  student?: PersonRef;
  amountMinor: number;
  paidOn: string;
  method: ProofMethod;
  reference: string;
  file?: { id: string; url: string; mime: string; name?: string } | null;
  fileUrl?: string | null;
  status: ProofStatus;
  reason?: string | null;
  submittedBy?: PersonRef | null;
  createdAt?: string;
}

export interface Concession {
  id: string;
  student: PersonRef;
  feeHead: PersonRef | null;
  type: ConcessionType;
  value: number;
  from: string;
  to: string | null;
  reason: string;
  status: string;
  approvalId?: string | null;
}

export interface LedgerEntry {
  id: string;
  date: string;
  kind: string;
  description: string;
  reference?: string | null;
  debitMinor: number;
  creditMinor: number;
  balanceMinor: number;
}

export interface FeeSummary {
  totalDueMinor: number;
  overdueMinor: number;
  advanceMinor: number;
  lastPayment: { amountMinor: number; paidOn: string; receiptNo?: string } | null;
  nextDue: { invoiceId?: string; invoiceNo?: string; dueDate: string; balanceMinor: number } | null;
}

export interface DueRow {
  student: InvoiceStudent;
  balanceMinor: number;
  oldestDueDate?: string | null;
  days?: number;
  buckets: { d0_30: number; d31_60: number; d61_90: number; d90plus: number };
}

export interface DailyCollection {
  branchId: string;
  date: string;
  totalMinor: number;
  byMethod: { method: PaymentMethod; amountMinor: number; count?: number }[];
  byCashier: { cashier: PersonRef; amountMinor: number; count?: number }[];
  payments: Payment[];
  closed: boolean;
  closing?: { cashCountedMinor: number; differenceMinor: number; note: string | null; closedBy?: PersonRef; closedAt?: string } | null;
}

export interface SiblingDiscount {
  id: string;
  schoolId: string;
  childIndex: number;
  percentOff: number;
  createdAt: string;
}

export interface FinanceDashboard {
  billedMinor: number;
  collectedMinor: number;
  outstandingMinor: number;
  overdueMinor: number;
  collectionRate: number;
  expensesMinor: number;
  payrollMinor: number;
  todayCollectedMinor: number;
}
