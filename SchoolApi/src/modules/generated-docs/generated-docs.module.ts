import { Global, Module } from '@nestjs/common';
import { DocumentRendererRegistry } from './document-renderer';
import { GeneratedDocumentService } from './generated-document.service';
import { RenderDocumentProcessor } from './render-document.processor';

/** Versioned PDFs (report cards, challans, receipts, payslips, certificates). */
@Global()
@Module({
  providers: [
    DocumentRendererRegistry,
    GeneratedDocumentService,
    RenderDocumentProcessor,
  ],
  exports: [DocumentRendererRegistry, GeneratedDocumentService],
})
export class GeneratedDocsModule {}
