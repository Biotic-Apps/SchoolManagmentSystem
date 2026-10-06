import type { NoticeStatus } from '../../../generated/prisma/client';
import { IdNameDto } from '../../../core/common/dto/id-name.dto';

export class AttachmentDto {
  id!: string;
  url!: string;
  mime!: string;
  name!: string;
}

export class NoticeAudienceDto {
  schoolWide!: boolean;
  branchIds!: string[];
  classIds!: string[];
  sectionIds!: string[];
  staffOnly!: boolean;
  guardianIds!: string[];
}

export class NoticeDto {
  id!: string;
  branchId!: string | null;
  title!: string;
  body!: string;
  audience!: NoticeAudienceDto;
  attachments!: AttachmentDto[];
  expiresOn!: string | null;
  pinned!: boolean;
  status!: NoticeStatus;
  author!: IdNameDto;
  publishedAt!: string | null;
  /** False only while the caller is a recipient who has not opened it. */
  read!: boolean;
  createdAt!: string;
}

export class NoticeReadsDto {
  total!: number;
  read!: number;
  unread!: number;
}
