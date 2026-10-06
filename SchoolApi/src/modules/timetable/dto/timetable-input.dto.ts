import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsInt,
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
