import type { PayrollSettings } from '../../../generated/prisma/client';
import type { PerDayBase } from '../calculation/payroll-calc';

export type WorkingDaysMode = 'CALENDAR' | 'FIXED';

/** School payroll rules as plain numbers (see PayrollSettings). */
export interface PayrollRules {
  workingDaysMode: WorkingDaysMode;
  fixedWorkingDays: number;
  perDayBase: PerDayBase;
  latesPerDeduction: number;
  lateDeductionDays: number;
  overtimeEnabled: boolean;
  overtimeMultiplier: number;
  overtimeGraceMinutes: number;
  /** null = branch staff arrive to leave time. */
  dailyHours: number | null;
}

/** Used until a school saves its own rules. */
export const DEFAULT_RULES: PayrollRules = {
  workingDaysMode: 'CALENDAR',
  fixedWorkingDays: 26,
  perDayBase: 'GROSS',
  latesPerDeduction: 3,
  lateDeductionDays: 1,
  overtimeEnabled: true,
  overtimeMultiplier: 1.5,
  overtimeGraceMinutes: 15,
  dailyHours: null,
};

export function toRules(row: PayrollSettings | null): PayrollRules {
  if (!row) return DEFAULT_RULES;
  return {
    workingDaysMode: row.workingDaysMode === 'FIXED' ? 'FIXED' : 'CALENDAR',
    fixedWorkingDays: row.fixedWorkingDays,
    perDayBase: row.perDayBase === 'BASIC' ? 'BASIC' : 'GROSS',
    latesPerDeduction: row.latesPerDeduction,
    lateDeductionDays: Number(row.lateDeductionDays),
    overtimeEnabled: row.overtimeEnabled,
    overtimeMultiplier: Number(row.overtimeMultiplier),
    overtimeGraceMinutes: row.overtimeGraceMinutes,
    dailyHours: row.dailyHours === null ? null : Number(row.dailyHours),
  };
}
