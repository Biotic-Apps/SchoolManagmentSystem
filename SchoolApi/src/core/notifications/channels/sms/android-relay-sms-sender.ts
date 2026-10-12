import type { PrismaService } from '../../../prisma/prisma.service';
import type { OutgoingSms, SmsSender } from './sms-sender';

/**
 * SMS_DRIVER=android-relay: stores messages in `sms_outbox` for the school's
 * Android phone to pick up via polling and send as a real SMS.
 *
 * `send()` only inserts; the actual delivery is asynchronous — the phone
 * polls GET /api/v1/sms-gateway/pending and acknowledges each message.
 */
export class AndroidRelaySmsSender implements SmsSender {
  constructor(private readonly prisma: PrismaService) {}

  async send(sms: OutgoingSms): Promise<void> {
    // schoolId is resolved later by the channel layer that holds SenderIdentity;
    // at this level we store with a placeholder and let the gateway controller
    // scope by the authenticated user's school. For the outbox insert we need
    // the schoolId from context — pass it via the extended interface.
    const schoolId = (sms as OutgoingSms & { schoolId?: string }).schoolId;
    if (!schoolId) {
      throw new Error('android-relay requires schoolId on OutgoingSms');
    }

    await this.prisma.smsOutbox.create({
      data: {
        schoolId,
        to: sms.to,
        message: sms.message,
        senderId: sms.senderId ?? null,
        status: 'PENDING',
        attempts: 0,
      },
    });
  }
}
