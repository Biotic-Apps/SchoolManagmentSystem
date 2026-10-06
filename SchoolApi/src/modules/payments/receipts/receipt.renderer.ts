import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { BranchSettingsReader } from '../../branches/settings/branch-settings.reader';
import { sumMinor } from '../../finance-core/money';
import {
  DocumentRendererRegistry,
  type DocumentRenderer,
  type RenderedDocument,
} from '../../generated-docs/document-renderer';
import { SchoolPeopleService } from '../../school-day/school-people.service';
import { renderReceipt } from './receipt-pdf';

/** RECEIPT documents: one per payment, re-rendered (new version) after a reversal. */
@Injectable()
export class ReceiptRenderer implements DocumentRenderer, OnModuleInit {
  readonly kind = 'RECEIPT' as const;

  constructor(
    private readonly registry: DocumentRendererRegistry,
    private readonly prisma: PrismaService,
    private readonly settings: BranchSettingsReader,
    private readonly people: SchoolPeopleService,
  ) {}

  onModuleInit(): void {
    this.registry.register(this);
  }

  async render(paymentId: string): Promise<RenderedDocument> {
    const payment = await this.prisma.payment.findUniqueOrThrow({
      where: { id: paymentId },
      include: {
        student: {
          select: { firstName: true, lastName: true, admissionNo: true },
        },
        allocations: {
          include: { invoice: { select: { invoiceNo: true } } },
          orderBy: { createdAt: 'asc' },
        },
        refunds: { where: { status: 'APPROVED' } },
      },
    });
    const branch = await this.prisma.branch.findUniqueOrThrow({
      where: { id: payment.branchId },
      include: { school: { select: { name: true } } },
    });
    const names = await this.people.names([payment.receivedById]);
    const footer = await this.settings.get<string>(
      branch.id,
      'fees.receiptFooter',
    );
    const allocated = sumMinor(payment.allocations.map((a) => a.amountMinor));
    const refunded = sumMinor(payment.refunds.map((r) => r.amountMinor));
    const buffer = await renderReceipt({
      schoolName: branch.school.name,
      branchLine: [branch.name, branch.address, branch.phone]
        .filter(Boolean)
        .join(', '),
      receiptNo: payment.receiptNo,
      receivedOn: payment.receivedOn,
      studentName: `${payment.student.firstName} ${payment.student.lastName}`,
      admissionNo: payment.student.admissionNo,
      method: payment.method,
      reference: payment.reference,
      amountMinor: payment.amountMinor,
      advanceMinor: payment.amountMinor - allocated - refunded,
      refundedMinor: refunded,
      currency: payment.currency,
      receivedBy: names.get(payment.receivedById) ?? '-',
      allocations: payment.allocations.map((a) => ({
        invoiceNo: a.invoice.invoiceNo,
        amountMinor: a.amountMinor,
        reversed: a.reversed,
      })),
      reversed: payment.status === 'REVERSED',
      reversalReason: payment.reversalReason,
      footer: footer ?? '',
    });
    return { buffer, fileName: `receipt-${payment.receiptNo}.pdf` };
  }
}
