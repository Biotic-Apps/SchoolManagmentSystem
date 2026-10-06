import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';
import {
  TopicStatus,
  type SyllabusPlanStatus,
} from '../../../generated/prisma/client';
import {
  IsDateOnly,
  IsOptionalDateOnly,
} from '../../../core/common/validation/is-date-only';

export class TopicInputDto {
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  title!: string;

  @IsInt()
  @Min(1)
  order!: number;

  @IsDateOnly()
  targetDate!: string;
}

export class ChapterInputDto {
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  title!: string;

  @IsInt()
  @Min(1)
  order!: number;

  @IsArray()
  @ArrayMaxSize(100)
  @ValidateNested({ each: true })
  @Type(() => TopicInputDto)
  topics!: TopicInputDto[];
}

export class PlanDraftDto {
  @IsUUID()
  sectionId!: string;

  @IsUUID()
  subjectId!: string;

  @IsUUID()
  sessionId!: string;

  @IsArray()
  @ArrayMaxSize(60)
  @ValidateNested({ each: true })
  @Type(() => ChapterInputDto)
  chapters!: ChapterInputDto[];
}

export class PlanQueryDto {
  @IsOptional()
  @IsUUID()
  sectionId?: string;

  @IsOptional()
  @IsUUID()
  subjectId?: string;

  @IsOptional()
  @IsUUID()
  sessionId?: string;
}

export class TopicProgressDto {
  @IsIn(Object.values(TopicStatus))
  status!: TopicStatus;

  @IsOptionalDateOnly()
  completedOn?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  note?: string;
}

export class CoverageQueryDto {
  @IsOptional()
  @IsUUID()
  branchId?: string;

  @IsOptional()
  @IsUUID()
  sessionId?: string;

  @IsOptional()
  @IsUUID()
  classId?: string;
}

export class ProgressDto {
  total!: number;
  completed!: number;
  delayed!: number;
  percent!: number;
}

export class TopicDto {
  id!: string;
  title!: string;
  order!: number;
  targetDate!: string;
  status!: TopicStatus;
  completedOn!: string | null;
  isDelayed!: boolean;
  pendingReview!: boolean;
}

export class ChapterDto {
  id!: string;
  title!: string;
  order!: number;
  topics!: TopicDto[];
}

export class SyllabusPlanDto {
  id!: string;
  sectionId!: string;
  subjectId!: string;
  subjectName!: string;
  sessionId!: string;
  revision!: number;
  status!: SyllabusPlanStatus;
  approvalId!: string | null;
  comment!: string | null;
  chapters!: ChapterDto[];
  progress!: ProgressDto;
}

export class TopicProgressResultDto {
  status!: 'APPLIED' | 'PENDING_REVIEW';
  approvalId!: string | null;
  topic!: TopicDto;
}

export class CoverageRowDto extends ProgressDto {
  sectionId!: string;
  sectionName!: string;
  className!: string;
  subjectId!: string;
  subjectName!: string;
}
