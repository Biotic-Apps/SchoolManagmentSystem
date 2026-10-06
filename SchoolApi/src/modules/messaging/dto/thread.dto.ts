import type { MessageStatus } from '../../../generated/prisma/client';
import { AttachmentDto } from '../../notices/dto/notice.dto';

export class ThreadStudentDto {
  id!: string;
  name!: string;
  className!: string | null;
  sectionName!: string | null;
}

export class ThreadParticipantDto {
  userId!: string;
  name!: string;
  role!: string;
}

export class LastMessageDto {
  body!: string;
  at!: string;
  senderName!: string;
}

export class ThreadDto {
  id!: string;
  subject!: string;
  student!: ThreadStudentDto;
  participants!: ThreadParticipantDto[];
  lastMessage!: LastMessageDto | null;
  unreadCount!: number;
  closed!: boolean;
}

export class MessageDto {
  id!: string;
  threadId!: string;
  sender!: ThreadParticipantDto;
  body!: string;
  attachments!: AttachmentDto[];
  sentAt!: string;
  readByOthers!: boolean;
  status!: MessageStatus;
  deliveredSilently!: boolean;
}

export class ThreadDetailDto {
  thread!: ThreadDto;
  messages!: MessageDto[];
}

export class MessageRecipientDto {
  userId!: string;
  name!: string;
  role!: 'CLASS_TEACHER' | 'SUBJECT_TEACHER' | 'PRINCIPAL';
  subjectName?: string;
}
