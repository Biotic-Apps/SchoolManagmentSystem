import { Injectable } from '@nestjs/common';
import { AuditService } from '../../core/audit/audit.service';
import { PrismaService } from '../../core/prisma/prisma.service';
import { ProbationGate } from '../../core/probation/probation-gate';
import { BranchSettingsReader } from '../branches/settings/branch-settings.reader';
import { MessageDelivery } from './message-delivery.service';
import {
  MESSAGE_SEND_ACTION,
  MessageSendAction,
  type MessageSendPayload,
} from './message-send.action';

export interface SendInput {
  thread: { id: string; schoolId: string; branchId: string; subject: string };
  senderId: string;
  senderRole: string;
  /** Staff senders may be held for probation review. */
  isStaff: boolean;
  body: string;
  attachmentFileIds: string[];
}

/** Stores a message and sends it now, or holds it for probation review. */
@Injectable()
export class MessageSender {
  constructor(
    private readonly prisma: PrismaService,
    private readonly delivery: MessageDelivery,
    private readonly action: MessageSendAction,
    private readonly gate: ProbationGate,
    private readonly settings: BranchSettingsReader,
    private readonly audit: AuditService,
  ) {}

  async send(input: SendInput): Promise<string> {
    const review =
      input.isStaff &&
      (await this.settings.get<boolean>(
        input.thread.branchId,
        'messaging.reviewProbation',
      ));
    const message = await this.prisma.message.create({
      data: {
        threadId: input.thread.id,
        senderId: input.senderId,
        senderRole: input.senderRole,
        body: input.body,
        attachmentFileIds: input.attachmentFileIds,
        status: review ? 'PENDING_REVIEW' : 'SENT',
      },
    });
    await this.prisma.threadParticipant.updateMany({
      where: { threadId: input.thread.id, userId: input.senderId },
      data: { lastReadAt: message.sentAt },
    });
    const payload: MessageSendPayload = { messageId: message.id };
    if (!review) {
      const result = await this.prisma.$transaction((tx) =>
        this.delivery.deliver(message.id, tx),
      );
      this.stage(input, message.id, { status: 'SENT', ...result });
      return message.id;
    }
    const gated = await this.gate.run(
      { userId: input.senderId },
      {
        key: MESSAGE_SEND_ACTION,
        entityType: 'Message',
        entityId: message.id,
        schoolId: input.thread.schoolId,
        branchId: input.thread.branchId,
        title: `Message to parents: ${input.thread.subject}`,
        payload,
      },
      () =>
        this.prisma.$transaction((tx) =>
          this.action.apply(
            payload,
            { performedById: input.senderId, onBehalfOfStaffId: null },
            tx,
          ),
        ),
    );
    if (gated.status === 'PENDING_REVIEW')
      this.stage(input, message.id, {
        status: 'PENDING_REVIEW',
        approvalId: gated.approvalId,
      });
    return message.id;
  }

  private stage(input: SendInput, messageId: string, after: unknown): void {
    this.audit.stage({
      action: 'messages.send',
      entityType: 'Message',
      entityId: messageId,
      schoolId: input.thread.schoolId,
      branchId: input.thread.branchId,
      after: { threadId: input.thread.id, ...(after as object) },
    });
  }
}
