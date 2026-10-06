import type { Prisma } from '../../generated/prisma/client';
import type { AttachmentDto } from '../notices/dto/notice.dto';
import type {
  MessageDto,
  ThreadParticipantDto,
  ThreadStudentDto,
} from './dto/thread.dto';

export const THREAD_INCLUDE = {
  student: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      enrollments: {
        where: { status: 'ACTIVE' },
        take: 1,
        select: {
          section: {
            select: { name: true, schoolClass: { select: { name: true } } },
          },
        },
      },
    },
  },
  participants: {
    include: { user: { select: { name: true } } },
    orderBy: { id: 'asc' },
  },
} satisfies Prisma.MessageThreadInclude;

export type ThreadRow = Prisma.MessageThreadGetPayload<{
  include: typeof THREAD_INCLUDE;
}>;

export type MessageRow = Prisma.MessageGetPayload<object>;

/** Messages a viewer may see: sent ones, plus their own held/rejected ones. */
export const visibleTo = (userId: string | null): Prisma.MessageWhereInput =>
  userId
    ? { OR: [{ status: 'SENT' }, { senderId: userId }] }
    : { status: 'SENT' };

export function toStudentDto(row: ThreadRow): ThreadStudentDto {
  const section = row.student.enrollments[0]?.section;
  return {
    id: row.student.id,
    name: `${row.student.firstName} ${row.student.lastName}`,
    className: section?.schoolClass.name ?? null,
    sectionName: section?.name ?? null,
  };
}

export function toParticipants(row: ThreadRow): ThreadParticipantDto[] {
  return row.participants.map((p) => ({
    userId: p.userId,
    name: p.user.name,
    role: p.role,
  }));
}

export function toMessageDto(
  message: MessageRow,
  thread: ThreadRow,
  attachments: AttachmentDto[],
): MessageDto {
  const sender = thread.participants.find((p) => p.userId === message.senderId);
  const readByOthers = thread.participants.some(
    (p) =>
      p.userId !== message.senderId &&
      p.lastReadAt !== null &&
      p.lastReadAt >= message.sentAt,
  );
  return {
    id: message.id,
    threadId: message.threadId,
    sender: {
      userId: message.senderId,
      name: sender?.user.name ?? '',
      role: message.senderRole,
    },
    body: message.body,
    attachments,
    sentAt: message.sentAt.toISOString(),
    readByOthers,
    status: message.status,
    deliveredSilently: message.deliveredSilently,
  };
}
