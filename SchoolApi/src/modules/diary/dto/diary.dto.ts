import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayMaxSize,
  IsArray,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';
import { DiaryStatus } from '../../../generated/prisma/client';
import { IdNameDto } from '../../../core/common/dto/id-name.dto';
import {
  IsDateOnly,
  IsOptionalDateOnly,
} from '../../../core/common/validation/is-date-only';

export class DiaryQueryDto {
  @IsOptional()
  @IsUUID()
  sectionId?: string;

  @IsOptional()
  @IsUUID()
  branchId?: string;

  /** e.g. SUBMITTED for the moderation queue; without dates it looks back the full range. */
  @IsOptional()
  @IsEnum(DiaryStatus)
  status?: DiaryStatus;

  @IsOptionalDateOnly()
  date?: string;

  @IsOptionalDateOnly()
  from?: string;

  @IsOptionalDateOnly()
  to?: string;
}

export class SaveDiaryDto {
  @IsUUID()
  sectionId!: string;

  @IsUUID()
  subjectId!: string;

  @IsDateOnly()
  date!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(4000)
  topics!: string;

  @IsOptional()
  @IsString()
  @MaxLength(4000)
  homework?: string;

  @IsOptionalDateOnly()
  dueDate?: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(10)
  @IsUUID('all', { each: true })
  attachmentFileIds?: string[];

  @IsOptional()
  @IsString()
  @MinLength(8)
  @MaxLength(100)
  clientRequestId?: string;
}

export class PublishDiaryDto {
  @IsOptional()
  @IsString()
  @MinLength(8)
  @MaxLength(100)
  clientRequestId?: string;
}

export class ReturnDiaryDto {
  @IsString()
  @MinLength(1)
  @MaxLength(1000)
  comment!: string;
}

export class MissingDiaryQueryDto {
  @IsUUID()
  branchId!: string;

  @IsOptionalDateOnly()
  date?: string;
}

export class AttachmentDto {
  id!: string;
  url!: string;
  mime!: string;
  name!: string;
}

export class DiaryEntryDto {
  id!: string;
  sectionId!: string;
  className!: string;
  sectionName!: string;
  subject!: IdNameDto;
  date!: string;
  topics!: string;
  homework!: string | null;
  dueDate!: string | null;
  attachments!: AttachmentDto[];
  @ApiProperty({ enum: DiaryStatus })
  status!: DiaryStatus;
  revision!: number;
  author!: IdNameDto;
  onBehalfOf!: IdNameDto | null;
  comment!: string | null;
  approvalId!: string | null;
  publishedAt!: string | null;
}

export class MissingDiaryDto {
  sectionId!: string;
  className!: string;
  sectionName!: string;
  subject!: IdNameDto;
  teacher!: IdNameDto | null;
}
