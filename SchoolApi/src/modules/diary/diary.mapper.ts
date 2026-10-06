import { Injectable } from '@nestjs/common';
import type { Prisma } from '../../generated/prisma/client';
import { formatDate } from '../../core/common/dates';
import { UrlSigner } from '../../core/files/url-signer';
import { PrismaService } from '../../core/prisma/prisma.service';
import type { DiaryEntryDto } from './dto/diary.dto';

export const DIARY_INCLUDE = {
  section: {
    select: { name: true, schoolClass: { select: { name: true } } },
  },
  subject: { select: { id: true, name: true } },
  author: { select: { id: true, name: true } },
  onBehalfOf: { select: { id: true, name: true } },
} satisfies Prisma.DiaryEntryInclude;

export type DiaryRow = Prisma.DiaryEntryGetPayload<{
  include: typeof DIARY_INCLUDE;
}>;

@Injectable()
export class DiaryMapper {
  constructor(
    private readonly prisma: PrismaService,
    private readonly signer: UrlSigner,
  ) {}

  async toDtos(rows: DiaryRow[]): Promise<DiaryEntryDto[]> {
    const ids = [...new Set(rows.flatMap((r) => r.attachmentFileIds))];
    const files = ids.length
      ? await this.prisma.file.findMany({ where: { id: { in: ids } } })
      : [];
    const byId = new Map(files.map((f) => [f.id, f]));
    return rows.map((row) => ({
      id: row.id,
      sectionId: row.sectionId,
      className: row.section.schoolClass.name,
      sectionName: row.section.name,
      subject: row.subject,
      date: formatDate(row.date),
      topics: row.topics,
      homework: row.homework,
      dueDate: row.dueDate ? formatDate(row.dueDate) : null,
      attachments: row.attachmentFileIds
        .map((id) => byId.get(id))
        .filter((f) => !!f)
        .map((f) => ({
          id: f.id,
          url: this.signer.sign(f.id).url,
          mime: f.mime,
          name: f.originalName,
        })),
      status: row.status,
      revision: row.revision,
      author: row.author,
      onBehalfOf: row.onBehalfOf,
      comment: row.comment,
      approvalId: row.approvalId,
      publishedAt: row.publishedAt?.toISOString() ?? null,
    }));
  }

  async toDto(row: DiaryRow): Promise<DiaryEntryDto> {
    return (await this.toDtos([row]))[0];
  }
}
