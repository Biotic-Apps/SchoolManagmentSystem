import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service';
import {
  DocumentRendererRegistry,
  type DocumentRenderer,
  type RenderedDocument,
} from '../../generated-docs/document-renderer';
import { PAYSLIP_INCLUDE, toPayslipDto } from './payslip.mapper';
import { renderPayslip } from './payslip-pdf';

/** PAYSLIP documents; entityId = PayrollLine id. */
@Injectable()
export class PayslipRenderer implements DocumentRenderer, OnModuleInit {
  readonly kind = 'PAYSLIP' as const;

  constructor(
    private readonly registry: DocumentRendererRegistry,
    private readonly prisma: PrismaService,
  ) {}

  onModuleInit(): void {
    this.registry.register(this);
  }

  async render(lineId: string, version: number): Promise<RenderedDocument> {
    const line = await this.prisma.payrollLine.findUniqueOrThrow({
      where: { id: lineId },
      include: PAYSLIP_INCLUDE,
    });
    const [school, branch] = await Promise.all([
      this.prisma.school.findUniqueOrThrow({
        where: { id: line.run.schoolId },
        select: { name: true },
      }),
      this.prisma.branch.findUniqueOrThrow({
        where: { id: line.run.branchId },
        select: { name: true, address: true, phone: true },
      }),
    ]);
    const slip = toPayslipDto(line, branch.name, null);
    const buffer = await renderPayslip(slip, {
      schoolName: school.name,
      branchLine: [branch.name, branch.address, branch.phone]
        .filter(Boolean)
        .join(' · '),
      version,
    });
    const who = (line.staff.employeeNo ?? line.staff.id.slice(0, 8)).replace(
      /[^A-Za-z0-9-]/g,
      '',
    );
    return { buffer, fileName: `payslip-${line.run.month}-${who}.pdf` };
  }
}
