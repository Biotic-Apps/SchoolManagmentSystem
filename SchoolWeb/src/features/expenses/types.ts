import type { PersonRef } from "@/features/people/types";

// phase4-contract §D. Money is integer minor units; fields marked optional may be absent on older payloads.

export type ExpenseStatus = "DRAFT" | "SUBMITTED" | "APPROVED" | "REJECTED" | "PARTIALLY_PAID" | "PAID";
export type ExpensePaymentMethod = "CASH" | "BANK" | "CHEQUE";

export interface Vendor {
  id: string;
  name: string;
  contactPerson?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  ntn?: string | null;
}

export interface VendorInput {
  name: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  address?: string;
  ntn?: string;
}

export interface ExpenseCategory {
  id: string;
  name: string;
  code?: string | null;
  schoolId?: string;
}

export interface ExpenseCategoryInput {
  name: string;
  code?: string;
}

export interface ExpensePayment {
  id: string;
  amountMinor: number;
  method: ExpensePaymentMethod;
  reference?: string | null;
  paidOn: string;
  paidBy?: PersonRef | null;
}

export interface Expense {
  id: string;
  branchId?: string;
  categoryId?: string;
  category?: ExpenseCategory | null;
  vendorId?: string | null;
  vendor?: Pick<Vendor, "id" | "name"> | null;
  title: string;
  amountMinor: number;
  paidMinor?: number;
  balanceMinor?: number;
  billDate: string;
  dueDate?: string | null;
  billFileId?: string | null;
  billFile?: { id: string; url?: string | null } | null;
  billUrl?: string | null;
  recurring?: { monthly: boolean; untilMonth?: string | null } | null;
  recurringMonthly?: boolean;
  recurringUntil?: string | null;
  purchaseOrderId?: string | null;
  notes?: string | null;
  status: ExpenseStatus;
  payments?: ExpensePayment[];
  createdAt?: string;
}

export interface ExpenseInput {
  branchId: string;
  categoryId: string;
  vendorId?: string;
  title: string;
  amountMinor: number;
  billDate: string;
  dueDate?: string;
  billFileId?: string;
  recurring?: { monthly: true; untilMonth?: string };
  notes?: string;
}

export interface ExpensePaymentInput {
  amountMinor: number;
  method: ExpensePaymentMethod;
  reference?: string;
  paidOn: string;
}
