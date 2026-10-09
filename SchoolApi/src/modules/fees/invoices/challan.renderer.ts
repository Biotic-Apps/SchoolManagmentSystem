import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service';
import {
  DocumentRendererRegistry,
  type DocumentRenderer,
  type RenderedDocument,
} from '../../generated-docs/document-renderer';
import { ChallanPdf } from '../challans/challan-pdf';
import { ChallanSource } from '../challans/challan-source.service';

/**
 * CHALLAN: the bank challan of one invoice — bank, school and parent copies
 * on one A4 landscape page (same layout as the bulk print).
 */
@Injectable()
export class ChallanRenderer implements DocumentRenderer, OnModuleInit {
  readonly kind = 'CHALLAN' as const;

  constructor(
    private readonly registry: DocumentRendererRegistry,
    private readonly prisma: PrismaService,
    private readonly source: ChallanSource,
  ) {}

  onModuleInit(): void {
    this.registry.register(this);
  }

  async render(entityId: string): Promise<RenderedDocument> {
    const invoice = await this.prisma.invoice.findUniqueOrThrow({
      where: { id: entityId },
      select: { branchId: true, invoiceNo: true },
    });
    const school = await this.source.school(invoice.branchId);
    const pdf = new ChallanPdf();
    for (const view of await this.source.views([entityId], school))
      await pdf.add(view);
    return {
      buffer: await pdf.toBuffer(),
      fileName: `challan-${invoice.invoiceNo}.pdf`,
    };
  }
}
