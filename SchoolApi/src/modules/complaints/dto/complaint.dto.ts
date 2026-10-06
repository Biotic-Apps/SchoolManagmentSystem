import type {
  ComplaintCategory,
  ComplaintStatus,
} from '../../../generated/prisma/client';
import { IdNameDto } from '../../../core/common/dto/id-name.dto';

export class AttachmentDto {
  id!: string;
  url!: string;
  mime!: string;
  name!: string;
}

export class ComplainantDto extends IdNameDto {
  role!: string;
}

export class ComplaintUpdateDto {
  id!: string;
  author!: IdNameDto | null;
  message!: string;
  status!: ComplaintStatus | null;
  attachments!: AttachmentDto[];
  at!: string;
}

export class ComplaintDto {
  id!: string;
  ticketNo!: string;
  category!: ComplaintCategory;
  subject!: string;
  description!: string;
  status!: ComplaintStatus;
  escalationLevel!: number;
  slaDueAt!: string;
  overdue!: boolean;
  complainant!: ComplainantDto | null;
  against!: IdNameDto | null;
  student!: IdNameDto | null;
  assignee!: IdNameDto | null;
  attachments!: AttachmentDto[];
  updates!: ComplaintUpdateDto[];
  createdAt!: string;
}
