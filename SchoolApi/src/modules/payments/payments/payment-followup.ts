import { Injectable, Logger } from '@nestjs/common';
import type { Payment } from '../../../generated/prisma/client';
import { NotificationService } from '../../../core/notifications/notification.service';
import { formatMinor } from '../../finance-core/money';
import { GeneratedDocumentService } from '../../generated-docs/generated-document.service';
import { SchoolPeopleService } from '../../school-day/school-people.service';
import type { TaskRequester } from '../../tasks/async-task.service';

/**
 * After a payment is committed: render the receipt and tell the guardians.
 * Failures are logged, never undo the payment (the receipt can be requested again).
 */
@Injectable()
export class PaymentFollowup {
  private readonly logger = new Logger(PaymentFollowup.name);

  constructor(
    private readonly documents: GeneratedDocumentService,
    private readonly people: SchoolPeopleService,
    private readonly notifications: NotificationService,
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
      await this.notifications.notify({
        userIds: await this.people.guardianUserIds([payment.studentId]),
        category: 'FEE',
        title: 'Payment received',
        body: `${formatMinor(payment.amountMinor, payment.currency)} received for ${studentName}. Receipt ${payment.receiptNo}.`,
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
