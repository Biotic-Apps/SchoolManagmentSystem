import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsIn,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { FollowUpStatus, MeetingMode } from '../../../generated/prisma/client';
import { PaginationQueryDto } from '../../../core/common/pagination/pagination-query.dto';
import { IsDateOnly } from '../../../core/common/validation/is-date-only';
import { IsTime } from '../../../core/common/validation/is-time';

const isDirect = (o: CreateMeetingDto) => o.slotId === undefined;

/** Parent: `slotId` + `studentId` + `agenda`; staff: direct request without a slot. */
export class CreateMeetingDto {
  @IsOptional()
  @IsUUID()
  slotId?: string;

  @IsUUID()
  studentId!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(1000)
  agenda!: string;

  @ValidateIf(isDirect)
  @IsUUID()
  guardianId?: string;

  @ValidateIf(isDirect)
  @IsDateOnly()
  date?: string;

  @ValidateIf(isDirect)
  @IsTime()
  startTime?: string;

  @ValidateIf(isDirect)
  @IsTime()
  endTime?: string;

  @ValidateIf(isDirect)
  @IsIn(Object.values(MeetingMode))
  mode?: MeetingMode;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  location?: string;
}

export const MEETING_BOXES = ['upcoming', 'past'] as const;
export type MeetingBox = (typeof MEETING_BOXES)[number];

export class MeetingQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsIn(MEETING_BOXES)
  box?: MeetingBox;

  @IsOptional()
  @IsUUID()
  studentId?: string;
}

export class MeetingReasonDto {
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  reason?: string;
}

export class FollowUpInputDto {
  @IsString()
  @MinLength(1)
  @MaxLength(300)
  title!: string;

  @IsUUID()
  ownerUserId!: string;

  @IsDateOnly()
  dueDate!: string;
}

export class CompleteMeetingDto {
  @IsString()
  @MaxLength(5000)
  notes!: string;

  @IsBoolean()
  shareSummaryWithParent!: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  summary?: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @ValidateNested({ each: true })
  @Type(() => FollowUpInputDto)
  followUps?: FollowUpInputDto[];
}

export class FollowUpQueryDto {
  @IsOptional()
  @IsIn(['true', 'false'])
  mine?: 'true' | 'false';

  @IsOptional()
  @IsIn(Object.values(FollowUpStatus))
  status?: FollowUpStatus;
}
