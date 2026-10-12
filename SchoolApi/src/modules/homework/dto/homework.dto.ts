import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayMaxSize,
  IsArray,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import type {
  HomeworkStatus,
  SubmissionStatus,
} from '../../../generated/prisma/client';
import { IdNameDto } from '../../../core/common/dto/id-name.dto';
import {
  IsDateOnly,
  IsOptionalDateOnly,
} from '../../../core/common/validation/is-date-only';
import type { Attachment } from '../homework.mapper';

// ─── Query DTOs ──────────────────────────────────────────────

export class HomeworkQueryDto {
  @IsOptional()
  @IsUUID()
  sectionId?: string;

  @IsOptional()
  @IsUUID()
  branchId?: string;

  @IsOptional()
  @IsUUID()
  subjectId?: string;

  @IsOptionalDateOnly()
  from?: string;

  @IsOptionalDateOnly()
  to?: string;

  @IsOptional()
  @IsString()
  status?: string;
}

export class SubmissionQueryDto {
  @IsOptional()
  @IsString()
  status?: string;
}

// ─── Create / Update DTOs ────────────────────────────────────

export class CreateHomeworkDto {
  @IsUUID()
  sectionId!: string;

  @IsUUID()
  subjectId!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(500)
  title!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(4000)
  description!: string;

  @IsDateOnly()
  dueDate!: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(1000)
  maxMarks?: number;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(10)
  @IsUUID('all', { each: true })
  attachmentFileIds?: string[];
}

export class UpdateHomeworkDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(500)
  title?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(4000)
  description?: string;

  @IsOptionalDateOnly()
  dueDate?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(1000)
  maxMarks?: number | null;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(10)
  @IsUUID('all', { each: true })
  attachmentFileIds?: string[];
}

export class SubmitHomeworkDto {
  @IsOptional()
  @IsString()
  @MaxLength(4000)
  text?: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(10)
  @IsUUID('all', { each: true })
  fileIds?: string[];
}

export class GradeSubmissionDto {
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(1000)
  marks?: number;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  grade?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  feedback?: string;
}

// ─── Response DTOs ───────────────────────────────────────────

export class HomeworkDto {
  id!: string;
  schoolId!: string;
  branchId!: string;
  classId!: string;
  sectionId!: string;
  className!: string;
  sectionName!: string;
  subject!: IdNameDto;
  title!: string;
  description!: string;
  dueDate!: string;
  maxMarks!: number | null;
  attachments!: Attachment[];
  assignedBy!: IdNameDto;
  @ApiProperty({ enum: ['ACTIVE', 'ARCHIVED'] })
  status!: string;
  submissionCount!: number;
  gradedCount!: number;
  createdAt!: string;
}

export class HomeworkSubmissionDto {
  id!: string;
  homeworkId!: string;
  student!: IdNameDto;
  submittedAt!: string;
  text!: string | null;
  attachments!: Attachment[];
  marks!: number | null;
  grade!: string | null;
  feedback!: string | null;
  gradedBy!: IdNameDto | null;
  gradedAt!: string | null;
  @ApiProperty({ enum: ['SUBMITTED', 'LATE', 'GRADED', 'RETURNED'] })
  status!: string;
}
