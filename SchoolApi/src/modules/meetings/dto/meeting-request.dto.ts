import {
  IsIn,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';
import { MeetingMode } from '../../../generated/prisma/client';
import {
  IsDateOnly,
  IsOptionalDateOnly,
} from '../../../core/common/validation/is-date-only';
import { IsTime } from '../../../core/common/validation/is-time';

export class MeetingTeachersQueryDto {
  @IsUUID()
  studentId!: string;
}

/** One of the child's teachers (or the principal) a parent can meet. */
export class MeetingTeacherDto {
  userId!: string;
  name!: string;
  /** e.g. "Class teacher", "Mathematics", "Principal". */
  roles!: string[];
  /** Open slots from today on. */
  openSlots!: number;
}

/** Parent asks a teacher for a preferred time when no slot suits them. */
export class ParentMeetingRequestDto {
  @IsUUID()
  studentId!: string;

  @IsUUID()
  staffUserId!: string;

  @IsDateOnly()
  date!: string;

  @IsTime()
  startTime!: string;

  /** Defaults to 30 minutes after `startTime`. */
  @IsOptional()
  @IsTime()
  endTime?: string;

  @IsIn(Object.values(MeetingMode))
  mode!: MeetingMode;

  @IsString()
  @MinLength(1)
  @MaxLength(1000)
  agenda!: string;
}

/** Staff confirm a request; omitted fields keep what the parent asked for. */
export class AcceptMeetingDto {
  @IsOptionalDateOnly()
  date?: string;

  @IsOptional()
  @IsTime()
  startTime?: string;

  @IsOptional()
  @IsTime()
  endTime?: string;

  @IsOptional()
  @IsIn(Object.values(MeetingMode))
  mode?: MeetingMode;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  location?: string;
}
