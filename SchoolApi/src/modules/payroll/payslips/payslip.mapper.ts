import type { Prisma } from '../../../generated/prisma/client';
import { formatDate } from '../../../core/common/dates';
import { parseLineDetail } from '../calculation/line-detail';
import { adjustmentSign } from '../calculation/payroll-calc';
import { buildBreakdown } from './breakdown';
import type { PayslipDto, PayslipPdfDto } from './dto/payslip.dto';

export const PAYSLIP_INCLUDE = {
  run: true,
  staff: {
    select: {
      id: true,
      name: true,
      designation: true,
      employeeNo: true,
      userId: true,
      schoolId: true,
      branchId: true,
    },
  },
  payments: { orderBy: { paidOn: 'asc' } },
} satisfies Prisma.PayrollLineInclude;

export type PayslipLine = Prisma.PayrollLineGetPayload<{
  include: typeof PAYSLIP_INCLUDE;
}>;

export function toPayslipDto(
  line: PayslipLine,
  branchName: string,
  pdf: PayslipPdfDto | null,
): PayslipDto {
  const detail = parseLineDetail(line.detail);
  return {
    staff: {
      id: line.staff.id,
      name: line.staff.name,
      designation: line.designation,
      employeeNo: line.staff.employeeNo,
    },
    month: line.run.month,
    branch: { id: line.run.branchId, name: branchName },
    currency: 'PKR',
    basicMinor: Number(line.basicMinor),
    allowances: detail.allowances,
    deductions: detail.deductions,
    allowancesMinor: Number(line.allowancesMinor),
    deductionsMinor: Number(line.deductionsMinor),
    grossMinor: Number(line.basicMinor + line.allowancesMinor),
    workingDays: line.workingDays,
    unpaidLeaveDays: Number(line.unpaidLeaveDays),
    leaveDeductionMinor: Number(line.leaveDeductionMinor),
    adjustments: detail.adjustments.map((a) => ({
      kind: a.kind,
      amountMinor: a.amountMinor,
      signedMinor: Number(adjustmentSign(a.kind)) * a.amountMinor,
      reason: a.reason,
    })),
    adjustmentsMinor: Number(line.adjustmentsMinor),
    overtimeMinutes: line.overtimeMinutes,
    overtimeMinor: Number(line.overtimeMinor),
    breakdown: buildBreakdown(line, detail),
    netMinor: Number(line.netMinor),
    paidMinor: Number(line.paidMinor),
    balanceMinor: Number(line.netMinor - line.paidMinor),
    payments: line.payments.map((p) => ({
      id: p.id,
      amountMinor: Number(p.amountMinor),
      method: p.method,
      reference: p.reference,
      paidOn: formatDate(p.paidOn),
      createdAt: p.createdAt.toISOString(),
    })),
    status: line.status,
    pdf,
  };
}
