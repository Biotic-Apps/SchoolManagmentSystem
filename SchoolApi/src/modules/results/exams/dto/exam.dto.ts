import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { ExamStatus, ExamType } from '../../../../generated/prisma/client';
import { IdNameDto } from '../../../../core/common/dto/id-name.dto';
import { PaginationQueryDto } from '../../../../core/common/pagination/pagination-query.dto';

export class ExamQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsUUID()
  branchId?: string;

  @IsOptional()
  @IsUUID()
  sessionId?: string;

  @IsOptional()
  @IsUUID()
  termId?: string;

  @ApiPropertyOptional({ enum: ExamStatus })
  @IsOptional()
  @IsIn(Object.values(ExamStatus))
  status?: ExamStatus;
}

export class UpdateExamDto {
  @IsOptional()
  @IsUUID()
  termId?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({ enum: ExamType })
  @IsOptional()
  @IsIn(Object.values(ExamType))
  type?: ExamType;

  @IsOptional()
  @IsUUID()
  gradingSchemeId?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  weightPercent?: number;

  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(50)
  @IsUUID('all', { each: true })
  classIds?: string[];
}

export class CreateExamDto {
  @IsUUID()
  branchId!: string;

  @IsUUID()
  sessionId!: string;

  @IsOptional()
  @IsUUID()
  termId?: string;

  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name!: string;

  @ApiProperty({ enum: ExamType })
  @IsIn(Object.values(ExamType))
  type!: ExamType;

  @IsUUID()
  gradingSchemeId!: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  weightPercent?: number;

  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(50)
  @IsUUID('all', { each: true })
  classIds!: string[];
}

export class ExamStatusDto {
  @ApiProperty({ enum: ['MARKS_OPEN', 'MARKS_CLOSED'] })
  @IsIn(['MARKS_OPEN', 'MARKS_CLOSED'])
  status!: 'MARKS_OPEN' | 'MARKS_CLOSED';
}

export class ExamPaperDto {
  id!: string;
  classId!: string;
  className!: string;
  subject!: IdNameDto;
  date!: string;
  startTime!: string;
  endTime!: string;
  maxMarks!: number;
  passMarks!: number;
  roomId!: string | null;
}

export class ExamDto {
  id!: string;
  schoolId!: string;
  branchId!: string;
  sessionId!: string;
  termId!: string | null;
  name!: string;
  @ApiProperty({ enum: ExamType })
  type!: ExamType;
  gradingScheme!: IdNameDto;
  weightPercent!: number | null;
  classIds!: string[];
  classes!: IdNameDto[];
  @ApiProperty({ enum: ExamStatus })
  status!: ExamStatus;
  approvalId!: string | null;
  computedAt!: string | null;
  publishedAt!: string | null;
  /** Empty in lists; filled by detail and schedule responses. */
  papers!: ExamPaperDto[];
  createdAt!: string;
}

export class JobIdDto {
  jobId!: string;
}
