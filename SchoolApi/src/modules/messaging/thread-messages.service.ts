import { Injectable } from '@nestjs/common';
import { AuditService } from '../../core/audit/audit.service';
import { OK, type OkDto } from '../../core/common/dto/ok.dto';
import { conflict } from '../../core/common/errors/errors';
import type { AuthUser } from '../../core/common/types/auth-user';
import { PrismaService } from '../../core/prisma/prisma.service';
import type { Scope } from '../../core/rbac/scope/scope';
import { AttachmentsService } from '../notices/attachments.service';
import type {
  SendMessageDto,
  ThreadMessagesQueryDto,
} from './dto/thread-input.dto';
import type { MessageDto, ThreadDetailDto } from './dto/thread.dto';
import { MessageSender } from './message-sender.service';
import { ThreadAccessService } from './thread-access.service';
import { ThreadViewService } from './thread-view.service';
import {
  THREAD_INCLUDE,
  toMessageDto,
  visibleTo,
  type MessageRow,
  type ThreadRow,
} from './thread.mapper';

export const MESSAGE_PAGE_SIZE = 30;

/** Reading a thread page, replying and marking it read. */
@Injectable()
export class ThreadMessagesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly access: ThreadAccessService,
    private readonly view: ThreadViewService,
    private readonly sender: MessageSender,
    private readonly attachments: AttachmentsService,
    private readonly audit: AuditService,
  ) {}

  async detail(
    user: AuthUser,
    scope: Scope,
    id: string,
    query: ThreadMessagesQueryDto,
  ): Promise<ThreadDetailDto> {
    const { row, participant } = await this.access.load(user, scope, id);
    const viewerId = participant ? user.id : null;
    const messages = await this.prisma.message.findMany({
      where: {
        threadId: id,
        ...visibleTo(viewerId),
        ...(query.before ? { sentAt: { lt: new Date(query.before) } } : {}),
      },
      orderBy: { sentAt: 'desc' },
      take: MESSAGE_PAGE_SIZE,
    });
    return {
      thread: await this.view.toDto(row, viewerId),
      messages: await this.toDtos(messages.reverse(), row),
    };
  }

  async post(
    user: AuthUser,
    scope: Scope,
    id: string,
    dto: SendMessageDto,
  ): Promise<MessageDto> {
    const { row, participant } = await this.access.participantOf(
      user,
      scope,
      id,
    );
    if (row.closed) throw conflict('The thread is closed');
    const fileIds = await this.attachments.assertUsable(dto.attachmentFileIds, {
      schoolId: row.schoolId,
      userId: user.id,
    });
    const messageId = await this.sender.send({
      thread: row,
      senderId: user.id,
      senderRole: participant.role,
      isStaff: participant.role !== 'PARENT',
      body: dto.body,
      attachmentFileIds: fileIds,
    });
    const [message, fresh] = await Promise.all([
      this.prisma.message.findUniqueOrThrow({ where: { id: messageId } }),
      this.prisma.messageThread.findUniqueOrThrow({
        where: { id },
        include: THREAD_INCLUDE,
      }),
    ]);
    const [result] = await this.toDtos([message], fresh);
    return result;
  }

  async markRead(user: AuthUser, scope: Scope, id: string): Promise<OkDto> {
    const { row, participant } = await this.access.participantOf(
      user,
      scope,
      id,
    );
    await this.prisma.threadParticipant.update({
      where: { id: participant.id },
      data: { lastReadAt: new Date() },
    });
    this.audit.stage({
      action: 'messages.read',
      entityType: 'MessageThread',
      entityId: id,
      schoolId: row.schoolId,
      branchId: row.branchId,
    });
    return OK;
  }

  private async toDtos(
    messages: MessageRow[],
    thread: ThreadRow,
  ): Promise<MessageDto[]> {
    const files = await this.attachments.describe(
      messages.flatMap((m) => m.attachmentFileIds),
    );
    return messages.map((m) =>
      toMessageDto(
        m,
        thread,
        this.attachments.pick(files, m.attachmentFileIds),
      ),
    );
  }
}
