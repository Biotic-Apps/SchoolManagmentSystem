import { Injectable } from '@nestjs/common';
import { AuditService } from '../../../core/audit/audit.service';
import { parseDate } from '../../../core/common/dates';
import {
  conflict,
  invalid,
  notFound,
} from '../../../core/common/errors/errors';
import { schoolDate } from '../../../core/common/school-time';
import type { AuthUser } from '../../../core/common/types/auth-user';
import { PrismaService } from '../../../core/prisma/prisma.service';
import type { Scope } from '../../../core/rbac/scope/scope';
import { PayrollAccess } from '../payroll-access.service';
import type { PayrollRunDto } from '../runs/dto/run.dto';
import { PAYABLE_STATUSES } from '../runs/run-status';
import { RunViewService } from '../runs/run-view.service';
import type { CreatePayrollPaymentDto } from './dto/payroll-payment.dto';
import { lineStatusOf, runStatusAfterPayment } from './line-payment';

/** Salary disbursements against approved lines (partial allowed). */
@Injectable()
export class PayrollPaymentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly access: PayrollAccess,
    private readonly view: RunViewService,
    private readonly audit: AuditService,
  ) {}

  async pay(
    user: AuthUser,
    scope: Scope,
    runId: string,
    dto: CreatePayrollPaymentDto,
  ): Promise<PayrollRunDto> {
    const run = await this.access.run(scope, runId);
    if (dto.paidOn > schoolDate()) {
      throw invalid('paidOn cannot be in the future');
    }
    const amount = BigInt(dto.amountMinor);

    const result = await this.prisma.$transaction(async (tx) => {
      // Serialises payments of one run (line totals and run status).
      await tx.$queryRaw`SELECT id FROM payroll_runs WHERE id = ${run.id}::uuid FOR UPDATE`;
      const current = await tx.payrollRun.findUniqueOrThrow({
        where: { id: run.id },
      });
      if (!PAYABLE_STATUSES.includes(current.status)) {
        throw conflict(`Salaries of a ${current.status} run cannot be paid`);
      }
      const line = await tx.payrollLine.findUnique({
        where: { runId_staffId: { runId: run.id, staffId: dto.staffId } },
      });
      if (!line) throw notFound('Payroll line');
      const balance = line.netMinor - line.paidMinor;
      if (amount > balance) {
        throw conflict('Amount exceeds the salary balance', {
          balanceMinor: Number(balance),
        });
      }
      const payment = await tx.payrollPayment.create({
        data: {
          runId: run.id,
          lineId: line.id,
          staffId: line.staffId,
          amountMinor: amount,
          method: dto.method,
          reference: dto.reference?.trim() || null,
          paidOn: parseDate(dto.paidOn),
          paidById: user.id,
        },
      });
      const paid = line.paidMinor + amount;
      await tx.payrollLine.update({
        where: { id: line.id },
        data: { paidMinor: paid, status: lineStatusOf(line.netMinor, paid) },
      });
      const statuses = await tx.payrollLine.findMany({
        where: { runId: run.id },
        select: { status: true },
      });
      const status = runStatusAfterPayment(statuses.map((s) => s.status));
      await tx.payrollRun.update({
        where: { id: run.id },
        data: { status, version: { increment: 1 } },
      });
      return { payment, before: current.status, status, paid, line };
    });

    this.audit.stage({
      action: 'payroll.payment_add',
      entityType: 'PayrollPayment',
      entityId: result.payment.id,
      schoolId: run.schoolId,
      branchId: run.branchId,
      before: {
        runStatus: result.before,
        linePaidMinor: Number(result.line.paidMinor),
      },
      after: {
        runId: run.id,
        staffId: dto.staffId,
        amountMinor: dto.amountMinor,
        method: dto.method,
        reference: result.payment.reference,
        paidOn: dto.paidOn,
        linePaidMinor: Number(result.paid),
        runStatus: result.status,
      },
    });
    return this.view.one(run.id);
  }
}
