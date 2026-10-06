import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../core/prisma/prisma.service';
import type { ThreadDto } from './dto/thread.dto';
import {
  toParticipants,
  toStudentDto,
  visibleTo,
  type ThreadRow,
} from './thread.mapper';

/** Builds Thread DTOs with the viewer's last message and unread count. */
@Injectable()
export class ThreadViewService {
  constructor(private readonly prisma: PrismaService) {}

  /** `viewerId` null = read-only branch view (sent messages, no unread). */
  async toDto(row: ThreadRow, viewerId: string | null): Promise<ThreadDto> {
    const me = viewerId
      ? row.participants.find((p) => p.userId === viewerId)
      : undefined;
    const [last, unreadCount] = await Promise.all([
      this.prisma.message.findFirst({
        where: { threadId: row.id, ...visibleTo(viewerId) },
        orderBy: { sentAt: 'desc' },
        select: { body: true, sentAt: true, senderId: true },
      }),
      me
        ? this.prisma.message.count({
            where: {
              threadId: row.id,
              status: 'SENT',
              senderId: { not: me.userId },
              ...(me.lastReadAt ? { sentAt: { gt: me.lastReadAt } } : {}),
            },
          })
        : Promise.resolve(0),
    ]);
    const senderName = last
      ? (row.participants.find((p) => p.userId === last.senderId)?.user.name ??
        '')
      : '';
    return {
      id: row.id,
      subject: row.subject,
      student: toStudentDto(row),
      participants: toParticipants(row),
      lastMessage: last
        ? { body: last.body, at: last.sentAt.toISOString(), senderName }
        : null,
      unreadCount,
      closed: row.closed,
    };
  }

  toDtos(rows: ThreadRow[], viewerId: string | null): Promise<ThreadDto[]> {
    return Promise.all(rows.map((row) => this.toDto(row, viewerId)));
  }
}
