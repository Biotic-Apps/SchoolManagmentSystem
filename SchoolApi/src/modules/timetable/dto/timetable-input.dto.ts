import { ApiProperty, getSchemaPath } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';
import {
  IsDateOnly,
  IsOptionalDateOnly,
} from '../../../core/common/validation/is-date-only';
import { IsTime } from '../../../core/common/validation/is-time';

export class PeriodInputDto {
  @IsInt()
  @Min(1)
  @Max(20)
  index!: number;

  @IsTime()
  startTime!: string;

  @IsTime()
  endTime!: string;

  @IsBoolean()
  isBreak!: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  label?: string;
}

export class SetPeriodsDto {
  @IsArray()
  @ArrayMaxSize(20)
  @ValidateNested({ each: true })
  @Type(() => PeriodInputDto)
  periods!: PeriodInputDto[];

  /** Delete lessons on removed periods / new breaks instead of a 409 PERIODS_IN_USE. */
  @IsOptional()
  @IsBoolean()
  dropLessons?: boolean;
}

export class SetBellScheduleDto {
  /** Default schedule for every working day. */
  @IsArray()
  @ArrayMaxSize(20)
  @ValidateNested({ each: true })
  @Type(() => PeriodInputDto)
  default!: PeriodInputDto[];

  /** Weekday-specific schedules keyed "1".."7" (e.g. "5" = Friday); omitted days use the default. */
  @IsOptional()
  @IsObject()
  @ApiProperty({
    required: false,
    type: Object,
    additionalProperties: {
      type: 'array',
      items: { $ref: getSchemaPath(PeriodInputDto) },
    },
  })
  days?: Record<string, PeriodInputDto[]>;

  /** Delete lessons on removed periods / new breaks instead of a 409 PERIODS_IN_USE. */
  @IsOptional()
  @IsBoolean()
  dropLessons?: boolean;
}

/** PUT /timetables/:sectionId/slots/:day/:periodIndex (autosave of one cell). */
export class SetCellDto {
  @IsUUID()
  subjectId!: string;

  @IsUUID()
  staffId!: string;

  @IsOptional()
  @IsUUID()
  roomId?: string | null;

  /** Make the teacher this section's subject teacher when nobody is allocated yet. */
  @IsOptional()
  @IsBoolean()
  allocate?: boolean;
}

export class SlotInputDto {
  @IsInt()
  @Min(1)
  @Max(7)
  day!: number;

  @IsInt()
  @Min(1)
  @Max(20)
  periodIndex!: number;

  @IsUUID()
  subjectId!: string;

  @IsUUID()
  staffId!: string;

  @IsOptional()
  @IsUUID()
  roomId?: string;
}

export class SetSlotsDto {
  @IsUUID()
  sessionId!: string;

  @IsArray()
  @ArrayMaxSize(140)
  @ValidateNested({ each: true })
  @Type(() => SlotInputDto)
  slots!: SlotInputDto[];
}

export class SectionQueryParamDto {
  @IsUUID()
  sectionId!: string;
}

export class WeekQueryDto {
  @IsOptionalDateOnly()
  weekOf?: string;

  @IsOptional()
  @IsUUID()
  studentId?: string;
}

export class CreateOverrideDto {
  @IsUUID()
  sectionId!: string;

  @IsDateOnly()
  date!: string;

  @IsInt()
  @Min(1)
  @Max(20)
  periodIndex!: number;

  @IsUUID()
  substituteStaffId!: string;

  @IsString()
  @MinLength(3)
  @MaxLength(300)
  reason!: string;
}

export class OverrideQueryDto {
  @IsOptional()
  @IsUUID()
  branchId?: string;

  @IsOptionalDateOnly()
  date?: string;
}
