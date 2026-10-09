import { Injectable, OnModuleInit } from '@nestjs/common';
import {
  DocumentRendererRegistry,
  type DocumentRenderer,
  type RenderedDocument,
} from '../../generated-docs/document-renderer';
import { ReceiptSource } from './receipt-source';
import { renderThermalReceipt } from './receipt-thermal';

/** RECEIPT_THERMAL documents: the same receipt sized for 80 mm printers. */
@Injectable()
export class ThermalReceiptRenderer implements DocumentRenderer, OnModuleInit {
  readonly kind = 'RECEIPT_THERMAL' as const;

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
      buffer: await renderThermalReceipt(data),
      fileName: `receipt-${data.receiptNo}-80mm.pdf`,
    };
  }
}
