import { Injectable } from '@nestjs/common';
import { invalid, notFound } from '../../../core/common/errors/errors';
import { PrismaService } from '../../../core/prisma/prisma.service';
import type { Scope } from '../../../core/rbac/scope/scope';
import { OPEN_STATUSES } from '../../finance-core/invoice-state';
import { ChallanPdf } from './challan-pdf';
import { ChallanSource } from './challan-source.service';

@Injectable()
export class FamilyChallanService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly source: ChallanSource,
  ) {}

  /** Generate a combined challan PDF for all open invoices of a guardian's children. */
  async forGuardian(
    scope: Scope,
    guardianId: string,
    branchId: string,
  ): Promise<{ buffer: Buffer; fileName: string; pages: number }> {
    const guardian = await this.prisma.guardian.findFirst({
      where: { id: guardianId, schoolId: scope.schoolId },
    });
    if (!guardian) throw notFound('Guardian');

    const links = await this.prisma.studentGuardian.findMany({
      where: { guardianId, schoolId: scope.schoolId, status: 'VERIFIED' },
      select: { studentId: true },
    });
    const studentIds = links.map((l) => l.studentId);
    if (studentIds.length === 0) throw invalid('Guardian has no linked students');

    return this.generateFamilyPdf(studentIds, branchId, guardian.name);
  }

  /** Generate a combined challan PDF for specific student IDs. */
  async forStudents(
    scope: Scope,
    studentIds: string[],
    branchId: string,
  ): Promise<{ buffer: Buffer; fileName: string; pages: number }> {
    if (studentIds.length === 0) throw invalid('No students specified');
    return this.generateFamilyPdf(studentIds, branchId, 'family');
  }

  private async generateFamilyPdf(
    studentIds: string[],
    branchId: string,
    label: string,
  ): Promise<{ buffer: Buffer; fileName: string; pages: number }> {
    const invoices = await this.prisma.invoice.findMany({
      where: {
        studentId: { in: studentIds },
        branchId,
        status: { in: OPEN_STATUSES },
      },
      select: { id: true },
      orderBy: [{ studentId: 'asc' }, { dueDate: 'asc' }],
    });
    if (invoices.length === 0) throw invalid('No open invoices found for these students');

    const school = await this.source.school(branchId);
    const views = await this.source.views(
      invoices.map((i) => i.id),
      school,
    );
    const pdf = new ChallanPdf();
    for (const view of views) await pdf.add(view);
    const buffer = await pdf.toBuffer();
    const safeName = label.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
    return {
      buffer,
      fileName: `family-challan-${safeName}.pdf`,
      pages: pdf.pages,
    };
  }
}
