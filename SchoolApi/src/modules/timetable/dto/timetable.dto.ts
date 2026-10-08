import type { TimetableStatus } from '../../../generated/prisma/client';
import { ApiProperty } from '@nestjs/swagger';
import { IdNameDto } from '../../../core/common/dto/id-name.dto';

export class PeriodDto {
  index!: number;
  /** "Period N" ordinal among the day's teaching periods; null on breaks. */
  number!: number | null;
  startTime!: string;
  endTime!: string;
  isBreak!: boolean;
  label!: string | null;
}

export class SlotDto {
  day!: number;
  periodIndex!: number;
  subject!: IdNameDto;
  staff!: IdNameDto;
  room!: IdNameDto | null;
}

export const TIMETABLE_STATES = [
  'EMPTY',
  'DRAFT',
  'PUBLISHED',
  'PUBLISHED_WITH_CHANGES',
] as const;
export type TimetableState = (typeof TIMETABLE_STATES)[number];

export class TimetableDto {
  sectionId!: string;
  sessionId!: string;
  @ApiProperty({ enum: TIMETABLE_STATES })
  state!: TimetableState;
  /** null when no timetable exists yet. */
  @ApiProperty({
    enum: ['DRAFT', 'PUBLISHED', 'DRAFT_REVISION'],
    nullable: true,
  })
  status!: TimetableStatus | null;
  /** Number of publishes; show only when > 0. */
  version!: number;
  publishedAt!: string | null;
  draftUpdatedAt!: string | null;
  draftSlotCount!: number;
  publishedSlotCount!: number;
  /** Caller may edit this section's draft (class teacher, coordinator, head teacher, principal, super admin). */
  canEdit!: boolean;
  canPublish!: boolean;
  /** Why Publish is disabled (null when it is enabled or the caller only views). */
  publishBlockedReason!: string | null;
  slots!: SlotDto[];
  /** Default (day 0) bell rows. */
  periods!: PeriodDto[];
  /** Weekday-specific bell rows keyed "1".."7" (only days with their own schedule). */
  dayPeriods!: Record<string, PeriodDto[]>;
  /** Branch working days (ISO 1 = Monday). */
  workingDays!: number[];
}

export class ConflictDto {
  type!: string;
  @ApiProperty({ enum: ['error', 'warning'] })
  severity!: 'error' | 'warning';
  day!: number;
  periodIndex!: number;
  message!: string;
  otherSectionId?: string;
}

export class ConflictsDto {
  conflicts!: ConflictDto[];
}

export class TeacherSlotSectionDto {
  id!: string;
  name!: string;
  className!: string;
}

export class TeacherSlotDto {
  date!: string;
  day!: number;
  periodIndex!: number;
  /** "Period N" of that day's schedule (null if the period no longer exists). */
  periodNumber!: number | null;
  startTime!: string;
  endTime!: string;
  section!: TeacherSlotSectionDto;
  subject!: IdNameDto;
  staff!: IdNameDto;
  room!: IdNameDto | null;
  isSubstitute!: boolean;
}

export class OverrideDto {
  id!: string;
  sectionId!: string;
  date!: string;
  periodIndex!: number;
  originalStaff!: IdNameDto | null;
  substituteStaff!: IdNameDto;
  reason!: string;
  createdAt!: string;
}
