import { Injectable } from '@nestjs/common';
import { AuditService } from '../../../core/audit/audit.service';
import { notFound } from '../../../core/common/errors/errors';
import type { AuthUser } from '../../../core/common/types/auth-user';
import { PrismaService } from '../../../core/prisma/prisma.service';
import type { Scope } from '../../../core/rbac/scope/scope';
import { GeneratedDocumentService } from '../../generated-docs/generated-document.service';
import { SchoolPeopleService } from '../../school-day/school-people.service';
import { PayrollAccess } from '../payroll-access.service';
import { APPROVED_STATUSES } from '../runs/run-status';
import type { PayslipDto, PayslipPdfDto } from './dto/payslip.dto';
import {
  PAYSLIP_INCLUDE,
  toPayslipDto,
  type PayslipLine,
} from './payslip.mapper';

/** Payslips of approved runs: own via /me, others with payroll.view + branch scope. */
@Injectable()
export class PayslipsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly access: PayrollAccess,
    private readonly people: SchoolPeopleService,
    private readonly documents: GeneratedDocumentService,
    private readonly audit: AuditService,
  ) {}

  async mine(user: AuthUser, month?: string): Promise<PayslipDto> {
    const staff = await this.people.staffOfUser(user.id);
    if (!staff) throw notFound('Payslip');
    return this.build(user, await this.line(staff.id, month));
  }

  async forStaff(
    user: AuthUser,
    scope: Scope,
    staffId: string,
    month?: string,
  ): Promise<PayslipDto> {
    const staff = await this.access.staff(scope, staffId);
    const line = await this.line(staff.id, month);
    if (staff.userId !== user.id) {
      await this.audit.recordNow({
        action: 'payroll.payslip_read',
        entityType: 'PayrollLine',
        entityId: line.id,
        schoolId: staff.schoolId,
        branchId: staff.branchId,
        after: { staffId: staff.id, month: line.run.month },
      });
    }
    return this.build(user, line);
  }

  private async line(staffId: string, month?: string): Promise<PayslipLine> {
    const line = await this.prisma.payrollLine.findFirst({
      where: {
        staffId,
        run: {
          status: { in: APPROVED_STATUSES },
          ...(month ? { month } : {}),
        },
      },
      include: PAYSLIP_INCLUDE,
      orderBy: { run: { month: 'desc' } },
    });
    if (!line) throw notFound('Payslip');
    return line;
  }

  private async build(user: AuthUser, line: PayslipLine): Promise<PayslipDto> {
    const branch = await this.prisma.branch.findUnique({
      where: { id: line.run.branchId },
      select: { name: true },
    });
    return toPayslipDto(line, branch?.name ?? '', await this.pdf(user, line));
  }

  /** Latest PAYSLIP PDF; requested on first read when missing (e.g. seeded runs). */
  private async pdf(
    user: AuthUser,
    line: PayslipLine,
  ): Promise<PayslipPdfDto | null> {
    let document = await this.documents.latest('PAYSLIP', line.id);
    if (!document) {
      await this.documents.request(user, {
        kind: 'PAYSLIP',
        entityId: line.id,
        schoolId: line.run.schoolId,
        ownerUserId: line.staff.userId ?? user.id,
      });
      document = await this.documents.latest('PAYSLIP', line.id);
    }
    const view = this.documents.view(document);
    return view
      ? {
          status: view.status,
          fileUrl: view.fileUrl,
          generatedAt: view.generatedAt,
        }
      : null;
  }
}
