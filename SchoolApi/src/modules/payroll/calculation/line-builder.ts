import type { Prisma } from '../../../generated/prisma/client';
import { toJson } from '../../../core/common/prisma-json';
import { parseComponents } from '../structures/current-structure';
import type { LineDetail } from './line-detail';
import { hourlyRateMinor, overtimePayMinor } from './overtime-pay';
import { calculateLine } from './payroll-calc';
import type { MonthInputs } from './payroll-inputs.service';
import { absenceHalfDays, lateHalfDays, tallyAttendance } from './unpaid-days';

export interface LineStructure {
  id: string;
  basicMinor: bigint;
  allowances: unknown;
  deductions: unknown;
  overtimeRateMinor: bigint | null;
}

export interface LineStaff {
  id: string;
  designation: string;
}

/** One staff member's payroll line from the month inputs and their structure. */
export function buildLine(
  runId: string,
  staff: LineStaff,
  structure: LineStructure,
  inputs: MonthInputs,
): Prisma.PayrollLineCreateManyInput {
  const { rules } = inputs;
  const own = inputs.of(staff.id);
  const tally = tallyAttendance(inputs.workingDays, own.leaves, own.attendance);
  const absence = absenceHalfDays(tally);
  const late = lateHalfDays(tally.late, rules);
  const allowances = parseComponents(structure.allowances);
  const deductions = parseComponents(structure.deductions);
  const adjustments = own.adjustments.map((a) => ({
    id: a.id,
    kind: a.kind,
    amountMinor: a.amountMinor,
    reason: a.reason,
  }));
  const rate = rules.overtimeEnabled
    ? hourlyRateMinor({
        basicMinor: structure.basicMinor,
        workingDays: inputs.payDays,
        dailyHours: inputs.dailyHours,
        multiplier: rules.overtimeMultiplier,
        fixedRateMinor: structure.overtimeRateMinor,
      })
    : 0n;
  const overtimeMinutes = rules.overtimeEnabled
    ? own.overtime.approvedMinutes
    : 0;
  const overtimeMinor = overtimePayMinor(overtimeMinutes, rate);
  const result = calculateLine({
    basicMinor: structure.basicMinor,
    allowances,
    deductions,
    workingDays: inputs.payDays,
    unpaidHalfDays: absence,
    lateHalfDays: late,
    perDayBase: rules.perDayBase,
    overtimeMinor,
    adjustments,
  });
  const detail: LineDetail = {
    allowances,
    deductions,
    adjustments: adjustments.map((a) => ({
      ...a,
      amountMinor: Number(a.amountMinor),
    })),
    unpaidHalfDays: absence + late,
    grossMinor: Number(result.grossMinor),
    ...(result.uncappedNetMinor < 0n
      ? { uncappedNetMinor: Number(result.uncappedNetMinor) }
      : {}),
    attendance: {
      calendarDays: tally.workingDays,
      payDays: inputs.payDays,
      present: tally.present,
      late: tally.late,
      absent: tally.absent,
      halfDays: tally.halfDays,
      paidLeave: tally.paidLeave,
      unpaidLeave: tally.unpaidLeave,
      unmarked: tally.unmarked,
      perDayBase: rules.perDayBase,
      perDayMinor: Number(result.perDayMinor),
      absenceHalfDays: absence,
      absenceDeductionMinor: Number(result.absenceDeductionMinor),
      latesPerDeduction: rules.latesPerDeduction,
      lateDeductionDays: rules.lateDeductionDays,
      lateHalfDays: late,
      lateDeductionMinor: Number(result.lateDeductionMinor),
    },
    overtime: {
      minutes: overtimeMinutes,
      hourlyRateMinor: Number(rate),
      multiplier:
        structure.overtimeRateMinor && structure.overtimeRateMinor > 0n
          ? null
          : rules.overtimeMultiplier,
      dailyHours: inputs.dailyHours,
      amountMinor: Number(overtimeMinor),
      entryIds: rules.overtimeEnabled ? own.overtime.approvedIds : [],
      pendingMinutes: own.overtime.pendingMinutes,
    },
  };
  return {
    runId,
    staffId: staff.id,
    designation: staff.designation,
    structureId: structure.id,
    basicMinor: result.basicMinor,
    allowancesMinor: result.allowancesMinor,
    deductionsMinor: result.deductionsMinor,
    workingDays: inputs.payDays,
    unpaidLeaveDays: ((absence + late) / 2).toFixed(1),
    leaveDeductionMinor: result.leaveDeductionMinor,
    adjustmentsMinor: result.adjustmentsMinor,
    overtimeMinutes,
    overtimeMinor,
    netMinor: result.netMinor,
    detail: toJson(detail),
  };
}
