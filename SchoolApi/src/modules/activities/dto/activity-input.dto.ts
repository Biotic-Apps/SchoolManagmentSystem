import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsISO8601,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { ActivityStatus, ActivityType } from '../../../generated/prisma/client';
import { PaginationQueryDto } from '../../../core/common/pagination/pagination-query.dto';
import { IsOptionalDateOnly } from '../../../core/common/validation/is-date-only';

export class ActivityAudienceInputDto {
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(200)
  @IsUUID('all', { each: true })
  sectionIds?: string[];

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(100)
  @IsUUID('all', { each: true })
  classIds?: string[];

  @IsOptional()
  @IsBoolean()
  wholeBranch?: boolean;
}

export class UpdateActivityDto {
  @IsOptional()
  @IsIn(Object.values(ActivityType))
  type?: ActivityType;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  description?: string;

  @IsOptional()
  @IsISO8601()
  startAt?: string;

  @IsOptional()
  @IsISO8601()
  endAt?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  venue?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => ActivityAudienceInputDto)
  audience?: ActivityAudienceInputDto;

  @IsOptional()
  @IsBoolean()
  consentRequired?: boolean;

  @IsOptionalDateOnly()
  consentDeadline?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  feeMinor?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  maxParticipants?: number;
}

export class CreateActivityDto {
  @IsUUID()
  branchId!: string;

  @IsIn(Object.values(ActivityType))
  type!: ActivityType;

  @IsString()
  @MinLength(1)
  @MaxLength(200)
  title!: string;

  @IsString()
  @MaxLength(5000)
  description!: string;

  @IsISO8601()
  startAt!: string;

  @IsISO8601()
  endAt!: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  venue?: string;

  @ValidateNested()
  @Type(() => ActivityAudienceInputDto)
  audience!: ActivityAudienceInputDto;

  @IsBoolean()
  consentRequired!: boolean;

  @IsOptionalDateOnly()
  consentDeadline?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  feeMinor?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  maxParticipants?: number;
}

export class ActivityQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsUUID()
  branchId?: string;

  @IsOptional()
  @IsIn(Object.values(ActivityType))
  type?: ActivityType;

  @IsOptional()
  @IsIn(Object.values(ActivityStatus))
  status?: ActivityStatus;

  @IsOptionalDateOnly()
  from?: string;

  @IsOptionalDateOnly()
  to?: string;
}

export class MineQueryDto {
  @IsUUID()
  studentId!: string;
}

export class ActivityCommentDto {
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  comment?: string;
}

export const ACTIVITY_STATUS_TARGETS = [
  'ONGOING',
  'COMPLETED',
  'CANCELLED',
] as const;
export type ActivityStatusTarget = (typeof ACTIVITY_STATUS_TARGETS)[number];

export class ActivityStatusDto {
  @IsIn(ACTIVITY_STATUS_TARGETS)
  status!: ActivityStatusTarget;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  reason?: string;
}
