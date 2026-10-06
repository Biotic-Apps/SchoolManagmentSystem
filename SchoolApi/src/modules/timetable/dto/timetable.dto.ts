import type { TimetableStatus } from '../../../generated/prisma/client';
import { IdNameDto } from '../../../core/common/dto/id-name.dto';

export class PeriodDto {
  index!: number;
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

export class TimetableDto {
  sectionId!: string;
  sessionId!: string;
  status!: TimetableStatus;
  version!: number;
  publishedAt!: string | null;
  slots!: SlotDto[];
  periods!: PeriodDto[];
}

export class ConflictDto {
  type!: string;
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
