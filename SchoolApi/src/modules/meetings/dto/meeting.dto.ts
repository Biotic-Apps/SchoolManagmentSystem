import type {
  FollowUpStatus,
  MeetingMode,
  MeetingStatus,
} from '../../../generated/prisma/client';
import { IdNameDto } from '../../../core/common/dto/id-name.dto';
import { SlotStaffDto } from './slot.dto';

export class FollowUpDto {
  id!: string;
  meetingId!: string;
  title!: string;
  owner!: IdNameDto;
  dueDate!: string;
  status!: FollowUpStatus;
}

export class MeetingDto {
  id!: string;
  student!: IdNameDto;
  guardian!: IdNameDto;
  staff!: SlotStaffDto;
  date!: string;
  startTime!: string;
  endTime!: string;
  mode!: MeetingMode;
  location!: string | null;
  agenda!: string;
  status!: MeetingStatus;
  /** Staff only (null for parents). */
  notes!: string | null;
  /** Parents see it only when shared. */
  summary!: string | null;
  followUps!: FollowUpDto[];
}
