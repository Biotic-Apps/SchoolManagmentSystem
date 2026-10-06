import type { Prisma } from '../../generated/prisma/client';
import { formatDate } from '../../core/common/dates';
import type { AttachmentDto, NoticeDto } from './dto/notice.dto';
import { readNoticeAudience } from './notice-audience';

export const noticeInclude = (userId: string) =>
  ({
    author: { select: { id: true, name: true } },
    recipients: { where: { userId }, select: { readAt: true } },
  }) satisfies Prisma.NoticeInclude;

export type NoticeRow = Prisma.NoticeGetPayload<{
  include: ReturnType<typeof noticeInclude>;
}>;

export function toNoticeDto(
  row: NoticeRow,
  attachments: AttachmentDto[],
): NoticeDto {
  const mine = row.recipients[0];
  return {
    id: row.id,
    branchId: row.branchId,
    title: row.title,
    body: row.body,
    audience: readNoticeAudience(row.audience),
    attachments,
    expiresOn: row.expiresOn ? formatDate(row.expiresOn) : null,
    pinned: row.pinned,
    status: row.status,
    author: row.author,
    publishedAt: row.publishedAt?.toISOString() ?? null,
    read: mine ? mine.readAt !== null : true,
    createdAt: row.createdAt.toISOString(),
  };
}
