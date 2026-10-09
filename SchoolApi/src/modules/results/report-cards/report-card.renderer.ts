import { Injectable, OnModuleInit } from '@nestjs/common';
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
  ) {}

  onModuleInit(): void {
    this.registry.register(this);
  }

  async render(resultId: string, version: number): Promise<RenderedDocument> {
    const content = await this.loader.load(resultId);
    const pdf = new PdfBuilder();
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
