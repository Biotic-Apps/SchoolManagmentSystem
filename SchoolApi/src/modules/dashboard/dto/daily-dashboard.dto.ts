import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsUUID } from 'class-validator';
import { IsOptionalDateOnly } from '../../../core/common/validation/is-date-only';
import { TeacherSlotDto } from '../../timetable/dto/timetable.dto';
import { DiaryEntryDto } from '../../diary/dto/diary.dto';

export class PendingQueryDto {
  @IsOptional()
  @IsUUID()
  branchId?: string;

  @IsOptionalDateOnly()
  date?: string;
}

export class ChildTodayQueryDto {
  @IsUUID()
  studentId!: string;
}

export class DashboardPendingDto {
  unmarkedAttendance!: number;
  missingDiaries!: number;
  pendingApprovals!: number;
  pendingLeave!: number;
  openComplaints!: number;
  overdueComplaints!: number;
  delayedTopics!: number;
  todayIncidents!: number;
  earlyLeavesToday!: number;
  staffAbsentToday!: number;
}

export class AttendanceTodayDto {
  present!: number;
  absent!: number;
  late!: number;
  unmarked!: number;
}

export class SectionRegisterStatusDto {
  sectionId!: string;
  @ApiProperty({
    enum: ['UNMARKED', 'DRAFT', 'SUBMITTED', 'LOCKED', 'PENDING_REVIEW'],
  })
  status!: string;
}

export class PendingDiaryDto {
  sectionId!: string;
  subjectId!: string;
}

export class TeacherTodayDto {
  periods!: TeacherSlotDto[];
  registers!: SectionRegisterStatusDto[];
  diariesPending!: PendingDiaryDto[];
  unreadMessages!: number;
  assignedComplaints!: number;
}

export class ChildAttendanceTodayDto {
  @ApiProperty({
    enum: ['PRESENT', 'ABSENT', 'LATE', 'LEAVE', 'HALF_DAY', 'UNMARKED'],
  })
  status!: string;
}

export class NoticeBriefDto {
  id!: string;
  title!: string;
  body!: string;
  pinned!: boolean;
  publishedAt!: string | null;
  read!: boolean;
}

export class MeetingBriefStaffDto {
  userId!: string;
  name!: string;
}

export class MeetingBriefDto {
  id!: string;
  date!: string;
  startTime!: string;
  endTime!: string;
  mode!: string;
  location!: string | null;
  agenda!: string;
  status!: string;
  staff!: MeetingBriefStaffDto;
}

export class ChildTodayDto {
  attendance!: ChildAttendanceTodayDto;
  diary!: DiaryEntryDto[];
  notices!: NoticeBriefDto[];
  consentsPending!: number;
  nextMeeting!: MeetingBriefDto | null;
}
