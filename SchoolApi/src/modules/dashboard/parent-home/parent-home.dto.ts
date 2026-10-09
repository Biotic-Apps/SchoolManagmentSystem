import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';
import { DiaryEntryDto } from '../../diary/dto/diary.dto';
import { FeeSummaryDto } from '../../fees/student-fees/dto/student-fees.dto';
import { TeacherSlotDto } from '../../timetable/dto/timetable.dto';
import { MeetingBriefDto, NoticeBriefDto } from '../dto/daily-dashboard.dto';

export class ParentHomeQueryDto {
  @IsUUID()
  studentId!: string;
}

export class ClassTeacherDto {
  name!: string;
  userId!: string | null;
}

export class ParentHomeChildDto {
  id!: string;
  name!: string;
  photoUrl!: string | null;
  admissionNo!: string;
  className!: string | null;
  sectionName!: string | null;
  rollNo!: number | null;
  branchName!: string | null;
  branchPhone!: string | null;
  classTeacher!: ClassTeacherDto | null;
}

export class MonthAttendanceDto {
  /** YYYY-MM */
  month!: string;
  present!: number;
  absent!: number;
  late!: number;
  leave!: number;
  halfDay!: number;
  /** Leave and unmarked days are not counted; null before any marked day. */
  percent!: number | null;
}

export class ParentHomeAttendanceDto {
  @ApiProperty({
    enum: ['PRESENT', 'ABSENT', 'LATE', 'LEAVE', 'HALF_DAY', 'UNMARKED'],
  })
  today!: string;
  month!: MonthAttendanceDto;
}

export class LatestResultDto {
  examId!: string;
  examName!: string;
  percent!: number;
  grade!: string;
  position!: number | null;
  passed!: boolean;
  publishedAt!: string | null;
}

export class HomeworkDueDto {
  /** Published homework due today or later. */
  dueCount!: number;
  nextDueDate!: string | null;
}

export class ParentHomeEventDto {
  id!: string;
  @ApiProperty({
    enum: ['ACTIVITY', 'EVENT', 'HOLIDAY', 'VACATION', 'DEADLINE'],
  })
  kind!: string;
  title!: string;
  startDate!: string;
  endDate!: string | null;
}

export class ParentHomeDto {
  child!: ParentHomeChildDto;
  attendance!: ParentHomeAttendanceDto;
  /** Null when the role cannot see fees. */
  fees!: FeeSummaryDto | null;
  latestResult!: LatestResultDto | null;
  homework!: HomeworkDueDto;
  todayPeriods!: TeacherSlotDto[];
  /** Published diary of the last week, newest first (max 5). */
  diary!: DiaryEntryDto[];
  notices!: NoticeBriefDto[];
  /** Upcoming scheduled meetings (max 3). */
  meetings!: MeetingBriefDto[];
  /** Upcoming activities and calendar events (max 5). */
  events!: ParentHomeEventDto[];
  consentsPending!: number;
}
