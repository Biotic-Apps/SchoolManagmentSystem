import { Injectable, Logger } from '@nestjs/common';
import type { Payment } from '../../../generated/prisma/client';
import { NotificationService } from '../../../core/notifications/notification.service';
import { LedgerService } from '../../finance-core/ledger.service';
import { GeneratedDocumentService } from '../../generated-docs/generated-document.service';
import { SchoolPeopleService } from '../../school-day/school-people.service';
import type { TaskRequester } from '../../tasks/async-task.service';
import { paymentReceivedMessage } from './payment-received-message';

/**
 * After a payment is committed (counter, verified proof, online): render the
 * receipt and send guardians the fee-received alert (in-app + push + SMS,
 * as the school's notification switches allow) with the remaining balance.
 * Failures are logged, never undo the payment (the receipt can be requested again).
 */
@Injectable()
export class PaymentFollowup {
  private readonly logger = new Logger(PaymentFollowup.name);

  constructor(
    private readonly documents: GeneratedDocumentService,
    private readonly people: SchoolPeopleService,
    private readonly notifications: NotificationService,
    private readonly ledger: LedgerService,
  ) {}

  async afterRecord(
    requester: TaskRequester,
    payment: Payment,
    studentName: string,
  ): Promise<void> {
    try {
      await this.documents.request(requester, {
        kind: 'RECEIPT',
        entityId: payment.id,
        schoolId: payment.schoolId,
        ownerUserId: payment.receivedById,
      });
      const message = paymentReceivedMessage({
        studentName,
        amountMinor: payment.amountMinor,
        currency: payment.currency,
        receiptNo: payment.receiptNo,
        balanceMinor: await this.ledger.balance(payment.studentId),
      });
      await this.notifications.notify({
        userIds: await this.people.guardianUserIds([payment.studentId]),
        category: 'FEE',
        ...message,
        channels: ['PUSH', 'SMS'],
        data: {
          paymentId: payment.id,
          studentId: payment.studentId,
          receiptNo: payment.receiptNo,
        },
      });
    } catch (error) {
      this.logger.error(
        `Follow-up of payment ${payment.receiptNo} failed`,
        error instanceof Error ? error.stack : String(error),
      );
    }
  }
}
