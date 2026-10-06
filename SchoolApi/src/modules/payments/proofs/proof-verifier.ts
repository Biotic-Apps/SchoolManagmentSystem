import { Injectable } from '@nestjs/common';
import type { PaymentProof } from '../../../generated/prisma/client';
import { AuditService } from '../../../core/audit/audit.service';
import { conflict } from '../../../core/common/errors/errors';
import type { AuthUser } from '../../../core/common/types/auth-user';
import { PrismaService } from '../../../core/prisma/prisma.service';
import type { Allocation } from '../../finance-core/allocation';
import { balanceOf, OPEN_STATUSES } from '../../finance-core/invoice-state';
import { LedgerService } from '../../finance-core/ledger.service';
import { minBig } from '../../finance-core/money';
import { PaymentFollowup } from '../payments/payment-followup';
import { PaymentRecorder } from '../payments/payment-recorder';

/**
 * SUBMITTED → VERIFIED in one transaction with the payment it creates: the
 * proof's invoice gets up to its current balance, the rest is advance credit.
 */
@Injectable()
export class ProofVerifier {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ledger: LedgerService,
    private readonly recorder: PaymentRecorder,
    private readonly followup: PaymentFollowup,
    private readonly audit: AuditService,
  ) {}

  async verify(
    user: AuthUser,
    proof: PaymentProof,
    receivedOn: Date,
    note?: string,
  ): Promise<void> {
    const payment = await this.prisma.$transaction(async (tx) => {
      await this.ledger.lockStudent(tx, proof.studentId);
      const claimed = await tx.paymentProof.updateMany({
        where: { id: proof.id, status: 'SUBMITTED' },
        data: {
          status: 'VERIFIED',
          decidedById: user.id,
          decidedAt: new Date(),
          note: note ?? null,
        },
      });
      if (claimed.count === 0) throw conflict('The proof changed, reload');
      const invoice = await tx.invoice.findUniqueOrThrow({
        where: { id: proof.invoiceId },
      });
      const allocations: Allocation[] = [];
      if (OPEN_STATUSES.includes(invoice.status)) {
        const amount = minBig(proof.amountMinor, balanceOf(invoice));
        if (amount > 0n)
          allocations.push({ invoiceId: invoice.id, amountMinor: amount });
      }
      const created = await this.recorder.record(tx, {
        studentId: proof.studentId,
        branchId: proof.branchId,
        amountMinor: proof.amountMinor,
        method: proof.method,
        reference: proof.reference,
        receivedOn,
        receivedById: user.id,
        allocations,
        proofId: proof.id,
      });
      await tx.paymentProof.update({
        where: { id: proof.id },
        data: { paymentId: created.id },
      });
      return created;
    });
    this.audit.stage({
      action: 'payment-proof.verify',
      entityType: 'PaymentProof',
      entityId: proof.id,
      schoolId: proof.schoolId,
      branchId: proof.branchId,
      before: { status: proof.status },
      after: {
        status: 'VERIFIED',
        paymentId: payment.id,
        receiptNo: payment.receiptNo,
        unallocatedMinor: Number(payment.unallocatedMinor),
        note: note ?? null,
      },
    });
    const student = await this.prisma.student.findUniqueOrThrow({
      where: { id: proof.studentId },
      select: { firstName: true, lastName: true },
    });
    await this.followup.afterRecord(
      user,
      payment,
      `${student.firstName} ${student.lastName}`,
    );
  }
}
