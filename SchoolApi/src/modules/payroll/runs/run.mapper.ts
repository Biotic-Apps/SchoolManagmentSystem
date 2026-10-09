import type {
  ApprovalStatus,
  PayrollRun,
  Prisma,
} from '../../../generated/prisma/client';
import type { IdNameDto } from '../../../core/common/dto/id-name.dto';
import { sumMinor } from '../../finance-core/money';
import { parseLineDetail } from '../calculation/line-detail';
import { buildBreakdown } from '../payslips/breakdown';
import type { PayrollLineDto, PayrollRunDto } from './dto/run.dto';

export const LINE_INCLUDE = {
  staff: { select: { id: true, name: true, employeeNo: true, userId: true } },
} satisfies Prisma.PayrollLineInclude;

export type LineRow = Prisma.PayrollLineGetPayload<{
  include: typeof LINE_INCLUDE;
}>;

export type RunWithLines = PayrollRun & { lines: LineRow[] };

export interface RunContext {
  branchName: string;
  names: ReadonlyMap<string, string>;
  approval: { id: string; status: ApprovalStatus } | null;
  pendingOvertimeCount: number;
}

export function toLineDto(line: LineRow): PayrollLineDto {
  return {
    id: line.id,
    staffId: line.staffId,
    name: line.staff.name,
    designation: line.designation,
    employeeNo: line.staff.employeeNo,
    basicMinor: Number(line.basicMinor),
    allowancesMinor: Number(line.allowancesMinor),
    deductionsMinor: Number(line.deductionsMinor),
    workingDays: line.workingDays,
    unpaidLeaveDays: Number(line.unpaidLeaveDays),
    leaveDeductionMinor: Number(line.leaveDeductionMinor),
    adjustmentsMinor: Number(line.adjustmentsMinor),
    overtimeMinutes: line.overtimeMinutes,
    overtimeMinor: Number(line.overtimeMinor),
    grossMinor: Number(line.basicMinor + line.allowancesMinor),
    breakdown: buildBreakdown(line, parseLineDetail(line.detail)),
    netMinor: Number(line.netMinor),
    paidMinor: Number(line.paidMinor),
    balanceMinor: Number(line.netMinor - line.paidMinor),
    status: line.status,
    route: line.route,
    approvalId: line.approvalId,
  };
}

const person = (
  id: string | null,
  names: ReadonlyMap<string, string>,
): IdNameDto | null => (id ? { id, name: names.get(id) ?? '' } : null);

export function toRunDto(
  run: RunWithLines,
  context: RunContext,
): PayrollRunDto {
  const net = sumMinor(run.lines.map((l) => l.netMinor));
  const paid = sumMinor(run.lines.map((l) => l.paidMinor));
  return {
    id: run.id,
    branch: { id: run.branchId, name: context.branchName },
    month: run.month,
    status: run.status,
    currency: 'PKR',
    calculatedAt: run.calculatedAt?.toISOString() ?? null,
    calculatedBy: person(run.calculatedById, context.names),
    reviewedAt: run.reviewedAt?.toISOString() ?? null,
    reviewedBy: person(run.reviewedById, context.names),
    approvedAt: run.approvedAt?.toISOString() ?? null,
    approvedBy: person(run.approvedById, context.names),
    closedAt: run.closedAt?.toISOString() ?? null,
    approval: context.approval,
    totals: {
      netMinor: Number(net),
      paidMinor: Number(paid),
      balanceMinor: Number(net - paid),
    },
    pendingOvertimeCount: context.pendingOvertimeCount,
    lines: run.lines.map(toLineDto),
    version: run.version,
    createdAt: run.createdAt.toISOString(),
  };
}

/** The approval that currently matters: a pending routed one, else the run's. */
export const currentApprovalId = (run: PayrollRun): string | null =>
  run.pendingApprovalIds[0] ?? run.approvalId;
