import type { Query } from "@/lib/http";

// Every payroll key starts with "payroll" so one invalidation refreshes runs, lines and payslips.
export const payrollKeys = {
  all: ["payroll"] as const,
  runs: (branchId: string | null, month: string) => ["payroll", "runs", branchId, month] as const,
  run: (id: string | null) => ["payroll", "run", id] as const,
  structure: (staffId: string | null) => ["payroll", "structure", staffId] as const,
  adjustments: (params: Query) => ["payroll", "adjustments", params] as const,
  payslip: (staffId: string | null, month: string) => ["payroll", "payslip", staffId, month] as const,
  myPayslip: (month: string) => ["payroll", "payslip", "me", month] as const,
  settings: (branchId: string | null) => ["payroll", "settings", branchId] as const,
  overtime: (branchId: string | null, month: string) => ["payroll", "overtime", branchId, month] as const,
  staff: (branchId: string | null, designation: string | undefined) => ["payroll", "staff", branchId, designation] as const,
};
