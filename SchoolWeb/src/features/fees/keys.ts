import type { Query } from "@/lib/http";

// Every fees query key starts with "fees" so one invalidation refreshes balances everywhere.
export const feesKeys = {
  all: ["fees"] as const,
  heads: (schoolId: string | null) => ["fees", "heads", schoolId] as const,
  plans: (params: Query) => ["fees", "plans", params] as const,
  invoices: (params: Query) => ["fees", "invoices", params] as const,
  invoice: (id: string | null) => ["fees", "invoice", id] as const,
  payments: (params: Query) => ["fees", "payments", params] as const,
  proofs: (params: Query) => ["fees", "proofs", params] as const,
  concessions: (params: Query) => ["fees", "concessions", params] as const,
  ledger: (studentId: string | null) => ["fees", "ledger", studentId] as const,
  summary: (studentId: string | null) => ["fees", "summary", studentId] as const,
  dues: (params: Query) => ["fees", "dues", params] as const,
  collections: (branchId: string | null, date: string) => ["fees", "collections", branchId, date] as const,
  dashboard: (branchId: string | null, month: string) => ["fees", "dashboard", branchId, month] as const,
  siblingDiscounts: (schoolId: string | null) => ["fees", "sibling-discounts", schoolId] as const,
};
