import { Injectable } from '@nestjs/common';
import { notFound } from '../../../core/common/errors/errors';
import type { AuthUser } from '../../../core/common/types/auth-user';
import { PrismaService } from '../../../core/prisma/prisma.service';
import type { Scope } from '../../../core/rbac/scope/scope';
import { GeneratedDocumentService } from '../../generated-docs/generated-document.service';
import type { ReceiptJobDto } from '../payments/dto/payment.dto';
import { FinanceAccess } from '../shared/finance-access';
import type { ReceiptFormat } from './dto/receipt-query.dto';

const KIND = { a4: 'RECEIPT', thermal: 'RECEIPT_THERMAL' } as const;
/** Receipts rendered before the two-copy A4 layout are rendered again. */
const LAYOUT_SINCE = new Date('2026-10-09T08:00:00Z');

/** `GET /payments/:id/receipt?format=a4|thermal`: pollable job + current file. */
@Injectable()
export class ReceiptsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly access: FinanceAccess,
    private readonly documents: GeneratedDocumentService,
  ) {}

  async receipt(
    user: AuthUser,
    scope: Scope,
    paymentId: string,
    format: ReceiptFormat = 'a4',
  ): Promise<ReceiptJobDto> {
    const kind = KIND[format];
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
    });
    if (!payment) throw notFound('Payment');
    this.access.assertRecord(scope, payment, 'Payment');

    const latest = await this.documents.latest(kind, payment.id);
    // A receipt rendered before the reversal (or the current layout) must not be handed out again.
    const stale =
      !!latest &&
      latest.status !== 'PENDING' &&
      (latest.createdAt < LAYOUT_SINCE ||
        (!!payment.reversedAt && latest.createdAt < payment.reversedAt));
    const { jobId } = await this.documents.request(user, {
      kind,
      entityId: payment.id,
      schoolId: payment.schoolId,
      ownerUserId: payment.receivedById,
      fresh: stale || latest?.status === 'FAILED',
    });
    const view = this.documents.view(
      await this.documents.latest(kind, payment.id),
    );
    return {
      jobId,
      status: view?.status ?? 'PENDING',
      fileUrl: view?.status === 'READY' ? view.fileUrl : null,
    };
  }
}
