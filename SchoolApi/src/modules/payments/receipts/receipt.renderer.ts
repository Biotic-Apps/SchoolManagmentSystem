import { Injectable, OnModuleInit } from '@nestjs/common';
import {
  DocumentRendererRegistry,
  type DocumentRenderer,
  type RenderedDocument,
} from '../../generated-docs/document-renderer';
import { renderA4Receipt } from './receipt-a4';
import { ReceiptSource } from './receipt-source';

/**
 * RECEIPT documents: A4 with school and student copies, one per payment,
 * re-rendered (new version) after a reversal.
 */
@Injectable()
export class ReceiptRenderer implements DocumentRenderer, OnModuleInit {
  readonly kind = 'RECEIPT' as const;

  constructor(
    private readonly registry: DocumentRendererRegistry,
    private readonly source: ReceiptSource,
  ) {}

  onModuleInit(): void {
    this.registry.register(this);
  }

  async render(paymentId: string): Promise<RenderedDocument> {
    const data = await this.source.load(paymentId);
    return {
      buffer: await renderA4Receipt(data),
      fileName: `receipt-${data.receiptNo}.pdf`,
    };
  }
}
