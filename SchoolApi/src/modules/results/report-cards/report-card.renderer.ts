import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service';
import {
  DocumentRendererRegistry,
  type DocumentRenderer,
  type RenderedDocument,
} from '../../generated-docs/document-renderer';
import { PdfBuilder } from '../../generated-docs/pdf-builder';
import { slug } from '../printing/print-names';
import { drawReportCard } from './report-card.layout';
import { ReportCardLoader } from './report-card.loader';

/** REPORT_CARD PDF of one ExamResult. */
@Injectable()
export class ReportCardRenderer implements DocumentRenderer, OnModuleInit {
  readonly kind = 'REPORT_CARD' as const;

  constructor(
    private readonly registry: DocumentRendererRegistry,
    private readonly loader: ReportCardLoader,
    private readonly prisma: PrismaService,
  ) {}

  onModuleInit(): void {
    this.registry.register(this);
  }

  async render(resultId: string, version: number): Promise<RenderedDocument> {
    // Look up the latest ReportCard for this result to get its templateId
    const card = await this.prisma.reportCard.findFirst({
      where: { resultId },
      orderBy: { version: 'desc' },
      select: { templateId: true },
    });
    const content = await this.loader.load(
      resultId,
      card?.templateId ?? undefined,
    );
    const pdf = new PdfBuilder({ landscape: content.landscape });
    drawReportCard(
      pdf,
      content,
      `${content.schoolName} · generated ${new Date().toISOString().slice(0, 10)} · version ${version}`,
    );
    return {
      buffer: await pdf.toBuffer(),
      fileName: `report-card-${slug(content.admissionNo)}-${slug(content.examName)}-v${version}.pdf`,
    };
  }
}
