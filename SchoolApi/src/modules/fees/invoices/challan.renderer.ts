import { Injectable, OnModuleInit } from '@nestjs/common';
import { formatDate } from '../../../core/common/dates';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { formatMinor } from '../../finance-core/money';
import {
  DocumentRendererRegistry,
  type DocumentRenderer,
  type RenderedDocument,
} from '../../generated-docs/document-renderer';
import { PdfBuilder } from '../../generated-docs/pdf-builder';
import { InvoiceReader } from './invoice-reader.service';

const WATERMARK: Partial<Record<string, string>> = {
  DRAFT: 'DRAFT',
  PAID: 'PAID',
  CANCELLED: 'CANCELLED',
};

/** CHALLAN: one-page fee challan of an invoice (current amounts). */
@Injectable()
export class ChallanRenderer implements DocumentRenderer, OnModuleInit {
  readonly kind = 'CHALLAN' as const;

  constructor(
    private readonly registry: DocumentRendererRegistry,
    private readonly prisma: PrismaService,
    private readonly reader: InvoiceReader,
  ) {}

  onModuleInit(): void {
    this.registry.register(this);
  }

  async render(entityId: string, version: number): Promise<RenderedDocument> {
    const invoice = await this.reader.dto(entityId);
    const branch = await this.prisma.branch.findUniqueOrThrow({
      where: { id: invoice.branchId },
      select: {
        name: true,
        address: true,
        phone: true,
        school: { select: { name: true } },
      },
    });
    const money = (value: number) => formatMinor(value, invoice.currency);
    const subtitle = [branch.name, branch.address, branch.phone]
      .filter(Boolean)
      .join(' · ');
    const pdf = new PdfBuilder().header(
      branch.school.name,
      subtitle,
      'Fee Challan',
    );
    const mark = WATERMARK[invoice.status];
    if (mark) pdf.watermark(mark);
    pdf.fields([
      ['Invoice No', invoice.invoiceNo],
      ['Status', invoice.status],
      ['Student', invoice.student.name],
      ['Admission No', invoice.student.admissionNo],
      [
        'Class',
        [invoice.student.className, invoice.student.sectionName]
          .filter(Boolean)
          .join(' - '),
      ],
      ['Period', invoice.period ?? '-'],
      ['Issue Date', invoice.issueDate ?? '-'],
      ['Due Date', invoice.dueDate],
    ]);
    pdf.heading('Fee details');
    pdf.table(
      [
        { header: 'Fee head', weight: 2 },
        { header: 'Description', weight: 3 },
        { header: 'Amount', weight: 2, align: 'right' },
      ],
      invoice.lines.map((line) => [
        line.feeHead.name,
        line.description,
        money(line.amountMinor),
      ]),
    );
    const totals: string[][] = [['Subtotal', money(invoice.subtotalMinor)]];
    if (invoice.concessionMinor > 0)
      totals.push(['Concession', `- ${money(invoice.concessionMinor)}`]);
    if (invoice.lateFeeMinor > 0)
      totals.push(['Late fee', money(invoice.lateFeeMinor)]);
    totals.push(['Total', money(invoice.totalMinor)]);
    totals.push(['Paid', money(invoice.paidMinor)]);
    totals.push(['Balance due', money(invoice.balanceMinor)]);
    pdf.table(
      [
        { header: 'Summary', weight: 5 },
        { header: '', weight: 2, align: 'right' },
      ],
      totals,
      { boldLastRow: true },
    );
    if (invoice.payments.length > 0) {
      pdf.heading('Payments');
      pdf.table(
        [
          { header: 'Receipt', weight: 3 },
          { header: 'Date', weight: 2 },
          { header: 'Amount', weight: 2, align: 'right' },
        ],
        invoice.payments.map((p) => [
          p.receiptNo,
          p.paidOn,
          money(p.amountMinor),
        ]),
      );
    }
    pdf.footer(
      `Computer-generated challan · v${version} · ${formatDate(new Date())}`,
    );
    return {
      buffer: await pdf.toBuffer(),
      fileName: `challan-${invoice.invoiceNo}.pdf`,
    };
  }
}
