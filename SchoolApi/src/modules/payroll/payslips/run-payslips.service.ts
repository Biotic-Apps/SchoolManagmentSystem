import { Injectable } from '@nestjs/common';
import { AuditService } from '../../../core/audit/audit.service';
import { conflict } from '../../../core/common/errors/errors';
import { PrismaService } from '../../../core/prisma/prisma.service';
import type { Scope } from '../../../core/rbac/scope/scope';
import { PayrollAccess } from '../payroll-access.service';
import { isApproved } from '../runs/run-status';
import { PAYSLIP_INCLUDE, toPayslipDto } from './payslip.mapper';
import { renderPayslips } from './payslip-pdf';

/** Every payslip of a run in one PDF (one page each) for printing. */
@Injectable()
export class RunPayslipsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly access: PayrollAccess,
    private readonly audit: AuditService,
  ) {}

  async pdf(
    scope: Scope,
    runId: string,
  ): Promise<{ buffer: Buffer; fileName: string }> {
    const run = await this.access.run(scope, runId);
    const lines = await this.prisma.payrollLine.findMany({
      where: { runId: run.id },
      include: PAYSLIP_INCLUDE,
      orderBy: { staff: { name: 'asc' } },
    });
    if (lines.length === 0) throw conflict('Calculate the payroll first');
    const [school, branch] = await Promise.all([
      this.prisma.school.findUniqueOrThrow({
        where: { id: run.schoolId },
        select: { name: true },
      }),
      this.prisma.branch.findUniqueOrThrow({
        where: { id: run.branchId },
        select: { name: true, address: true, phone: true },
      }),
    ]);
    const buffer = await renderPayslips(
      lines.map((line) => toPayslipDto(line, branch.name, null)),
      {
        schoolName: school.name,
        branchLine: [branch.name, branch.address, branch.phone]
          .filter(Boolean)
          .join(' · '),
        version: run.version,
      },
      !isApproved(run.status),
    );
    await this.audit.recordNow({
      action: 'payroll.payslips_print',
      entityType: 'PayrollRun',
      entityId: run.id,
      schoolId: run.schoolId,
      branchId: run.branchId,
      after: { lines: lines.length },
    });
    return { buffer, fileName: `payslips-${run.month}.pdf` };
  }
}
