import { ApiProperty } from '@nestjs/swagger';
import { IdNameDto } from '../../../core/common/dto/id-name.dto';
import {
  ConflictDto,
  SlotDto,
  TIMETABLE_STATES,
  TimetableDto,
  type TimetableState,
} from './timetable.dto';

export class LessonCountDto {
  subjectId!: string;
  placed!: number;
  periodsPerWeek!: number | null;
}

/** Response of the per-cell autosave PUT/DELETE. */
export class CellResultDto {
  /** The saved lesson (PUT only). */
  slot?: SlotDto;
  /** Conflicts of this cell. */
  conflicts!: ConflictDto[];
  lesson!: LessonCountDto | null;
  @ApiProperty({ enum: TIMETABLE_STATES })
  state!: TimetableState;
  canPublish!: boolean;
  publishBlockedReason!: string | null;
  /** A subject-teacher allocation was created because of `allocate: true`. */
  allocated!: boolean;
}

export class BuilderSectionDto {
  id!: string;
  name!: string;
  group!: string | null;
  class!: IdNameDto;
  branchId!: string;
}

export class BuilderLessonDto {
  subject!: IdNameDto;
  periodsPerWeek!: number | null;
  placed!: number;
  teacher!: IdNameDto | null;
}

/** A teacher (staffId) or room (roomId) busy in another section. */
export class BusyDto {
  staffId?: string;
  roomId?: string;
  day!: number;
  periodIndex!: number;
  sectionId!: string;
  sectionName!: string;
  published!: boolean;
}

export class TimetableBuilderDto {
  timetable!: TimetableDto;
  section!: BuilderSectionDto;
  lessons!: BuilderLessonDto[];
  rooms!: IdNameDto[];
  busy!: BusyDto[];
  conflicts!: ConflictDto[];
  maxPeriodsPerDay!: number;
}
