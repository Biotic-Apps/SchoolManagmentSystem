import type { ReportParamType } from "./types";

interface ParamSpec {
  name: string;
  type: ReportParamType;
  label: string;
  required: boolean;
}

const param = (name: string, type: ReportParamType, label: string, required = true): ParamSpec => ({
  name,
  type,
  label,
  required,
});

const BRANCH = param("branchId", "branch", "Branch");
const MONTH = param("month", "month", "Month");
const FROM = param("from", "date", "From");
const TO = param("to", "date", "To");

/** Parameters per report key, used when the catalog does not describe them. */
export const DEFAULT_PARAMS: Record<string, ParamSpec[]> = {
  "attendance.monthly": [BRANCH, MONTH, param("sectionId", "section", "Section", false)],
  "attendance.staff": [BRANCH, MONTH],
  "results.analysis": [BRANCH, param("examId", "exam", "Exam")],
  "fees.collection": [BRANCH, FROM, TO],
  "fees.aging": [BRANCH],
  "fees.defaulters": [BRANCH, param("minDays", "number", "Overdue for at least (days)")],
  "payroll.summary": [BRANCH, MONTH],
  "expenses.summary": [BRANCH, FROM, TO],
  "inventory.stock": [BRANCH],
  "branch.comparison": [MONTH],
};

/** Names and descriptions per report key, used when the catalog sends only the key. */
export const REPORT_TEXT: Record<string, { name: string; description: string }> = {
  "attendance.monthly": {
    name: "Monthly student attendance",
    description: "Day-by-day attendance for each student over a month.",
  },
  "attendance.staff": { name: "Staff attendance", description: "Monthly attendance, late arrivals and leave for staff." },
  "results.analysis": { name: "Result analysis", description: "Pass rates, averages and grade spread for an exam." },
  "fees.collection": { name: "Fee collection", description: "Payments received in a date range, by method and fee head." },
  "fees.aging": { name: "Dues aging", description: "Outstanding balances grouped by how long they are overdue." },
  "fees.defaulters": { name: "Fee defaulters", description: "Students with dues overdue for at least the given days." },
  "payroll.summary": { name: "Payroll summary", description: "Gross pay, deductions and net pay for a month." },
  "expenses.summary": { name: "Expense summary", description: "Expenses by category and vendor in a date range." },
  "inventory.stock": { name: "Stock levels", description: "Current stock, issued items and low-stock alerts." },
  "branch.comparison": {
    name: "Branch comparison",
    description: "Attendance, results and collections side by side for each branch.",
  },
};

/** Default label per parameter type, for catalog params without a label. */
export const TYPE_LABEL: Partial<Record<ReportParamType, string>> = {
  branch: "Branch",
  month: "Month",
  class: "Class",
  section: "Section",
  session: "Session",
  exam: "Exam",
};
