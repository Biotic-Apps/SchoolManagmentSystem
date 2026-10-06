import { Injectable } from '@nestjs/common';
import { notFound } from '../../../core/common/errors/errors';
import type { AuthUser } from '../../../core/common/types/auth-user';
import { PrismaService } from '../../../core/prisma/prisma.service';
import type { Scope } from '../../../core/rbac/scope/scope';
import { GeneratedDocumentService } from '../../generated-docs/generated-document.service';
import type { ReceiptJobDto } from '../payments/dto/payment.dto';
import { FinanceAccess } from '../shared/finance-access';

/** `GET /payments/:id/receipt`: pollable job + current file. */
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
  ): Promise<ReceiptJobDto> {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
    });
    if (!payment) throw notFound('Payment');
    this.access.assertRecord(scope, payment, 'Payment');

    const latest = await this.documents.latest('RECEIPT', payment.id);
    // A receipt rendered before the reversal must not be handed out again.
    const stale =
      !!payment.reversedAt &&
      !!latest &&
      latest.createdAt < payment.reversedAt &&
      latest.status !== 'PENDING';
    const { jobId } = await this.documents.request(user, {
      kind: 'RECEIPT',
      entityId: payment.id,
      schoolId: payment.schoolId,
      ownerUserId: payment.receivedById,
      fresh: stale || latest?.status === 'FAILED',
    });
    const view = this.documents.view(
      await this.documents.latest('RECEIPT', payment.id),
    );
    return {
      jobId,
      status: view?.status ?? 'PENDING',
      fileUrl: view?.status === 'READY' ? view.fileUrl : null,
    };
  }
}
