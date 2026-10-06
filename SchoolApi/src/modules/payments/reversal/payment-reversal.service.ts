import { Injectable } from '@nestjs/common';
import { ApprovalService } from '../../../core/approvals/approval.service';
import { AuditService } from '../../../core/audit/audit.service';
import { conflict, forbidden } from '../../../core/common/errors/errors';
import type { AuthUser } from '../../../core/common/types/auth-user';
import { PrismaService } from '../../../core/prisma/prisma.service';
import type { Scope } from '../../../core/rbac/scope/scope';
import { principalOrAbove } from '../../finance-core/approval-routing';
import { formatMinor } from '../../finance-core/money';
import type { PaymentDto } from '../payments/dto/payment.dto';
import { PaymentReader } from '../payments/payment-reader';
import { FinanceAccess } from '../shared/finance-access';

/** `POST /payments/:id/reverse` → PAYMENT_REVERSAL approval (contract B3). */
@Injectable()
export class PaymentReversalService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly access: FinanceAccess,
    private readonly reader: PaymentReader,
    private readonly approvals: ApprovalService,
    private readonly audit: AuditService,
  ) {}

  async request(
    user: AuthUser,
    scope: Scope,
    id: string,
    reason: string,
  ): Promise<PaymentDto> {
    if (scope.guardian) throw forbidden();
    const payment = await this.reader.row(id);
    this.access.assertRecord(scope, payment, 'Payment');
    if (payment.status !== 'RECORDED')
      throw conflict(`The payment is ${payment.status.toLowerCase()}`);
    const refunds = await this.prisma.refund.count({
      where: { paymentId: id, status: { in: ['PENDING', 'APPROVED'] } },
    });
    if (refunds > 0)
      throw conflict('A payment with refunds cannot be reversed');

    await this.prisma.$transaction(async (tx) => {
      const moved = await tx.payment.updateMany({
        where: { id, status: 'RECORDED' },
        data: { status: 'REVERSAL_PENDING', reversalReason: reason },
      });
      if (moved.count === 0) throw conflict('The payment changed, reload');
      const approval = await this.approvals.create(
        {
          type: 'PAYMENT_REVERSAL',
          entityType: 'Payment',
          entityId: id,
          schoolId: payment.schoolId,
          branchId: payment.branchId,
          requestedById: user.id,
          title: `Reverse ${payment.receiptNo} (${formatMinor(payment.amountMinor, payment.currency)})`,
          payload: {
            paymentId: id,
            receiptNo: payment.receiptNo,
            amountMinor: Number(payment.amountMinor),
          },
          reason,
          amountMinor: payment.amountMinor,
          steps: principalOrAbove(user.activeRole),
        },
        tx,
      );
      await tx.payment.update({
        where: { id },
        data: { reversalApprovalId: approval.id },
      });
    });
    this.audit.stage({
      action: 'payment.reversal.request',
      entityType: 'Payment',
      entityId: id,
      schoolId: payment.schoolId,
      branchId: payment.branchId,
      before: { status: payment.status },
      after: { status: 'REVERSAL_PENDING', reason },
    });
    return this.reader.dto(id);
  }
}
