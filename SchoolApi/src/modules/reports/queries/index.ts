import { attendanceMonthly } from './attendance-monthly';
import { attendanceStaff } from './attendance-staff';
import { branchComparison } from './branch-comparison';
import { expensesSummary } from './expenses-summary';
import { feesAging } from './fees-aging';
import { feesCollection } from './fees-collection';
import { feesDefaulters } from './fees-defaulters';
import { inventoryStock } from './inventory-stock';
import { payrollSummary } from './payroll-summary';
import type { ReportQuery } from './report-query';
import { resultsAnalysis } from './results-analysis';
import { syllabusCoverage } from './syllabus-coverage';

/** Report key → query (keys match `REPORTS` in report-catalog.ts). */
export const REPORT_QUERIES: Record<string, ReportQuery> = {
  'attendance.monthly': attendanceMonthly,
  'attendance.staff': attendanceStaff,
  'syllabus.coverage': syllabusCoverage,
  'results.analysis': resultsAnalysis,
  'fees.collection': feesCollection,
  'fees.aging': feesAging,
  'fees.defaulters': feesDefaulters,
  'payroll.summary': payrollSummary,
  'expenses.summary': expensesSummary,
  'inventory.stock': inventoryStock,
  'branch.comparison': branchComparison,
};
