import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
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
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  DifficultyLevel,
  ExamPaperStatus,
  QuestionType,
} from '../../../generated/prisma/client';
import { PaginationQueryDto } from '../../../core/common/pagination/pagination-query.dto';

export class ExamPaperQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsUUID()
  schoolId?: string;

  @IsOptional()
  @IsUUID()
  subjectId?: string;

  @IsOptional()
  @IsUUID()
  classId?: string;

  @ApiPropertyOptional({ enum: ExamPaperStatus })
  @IsOptional()
  @IsIn(Object.values(ExamPaperStatus))
  status?: ExamPaperStatus;
}

export class GenerateSectionInput {
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  title!: string;

  @IsInt()
  @Min(1)
  @Max(50)
  questionCount!: number;

  @ApiProperty({ enum: QuestionType })
  @IsIn(Object.values(QuestionType))
  type!: QuestionType;

  @ApiProperty({ enum: DifficultyLevel })
  @IsIn(Object.values(DifficultyLevel))
  difficulty!: DifficultyLevel;

  @IsInt()
  @Min(1)
  @Max(100)
  marksPerQuestion!: number;
}

export class GenerateExamPaperDto {
  @IsUUID()
  schoolId!: string;

  @IsUUID()
  subjectId!: string;

  @IsUUID()
  classId!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(200)
  title!: string;

  @IsInt()
  @Min(1)
  @Max(500)
  totalMarks!: number;

  @IsInt()
  @Min(10)
  @Max(300)
  duration!: number;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => GenerateSectionInput)
  sections!: GenerateSectionInput[];
}

export class UpdateExamPaperDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  title?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(500)
  totalMarks?: number;

  @IsOptional()
  @IsInt()
  @Min(10)
  @Max(300)
  duration?: number;

  @ApiPropertyOptional({ enum: ExamPaperStatus })
  @IsOptional()
  @IsIn(Object.values(ExamPaperStatus))
  status?: ExamPaperStatus;
}

export interface PaperSectionDto {
  title: string;
  questionIds: string[];
  marks: number;
}

export class ExamPaperDto {
  id!: string;
  schoolId!: string;
  subjectId!: string;
  classId!: string;
  title!: string;
  totalMarks!: number;
  duration!: number;
  sections!: PaperSectionDto[];
  status!: string;
  createdById!: string;
  createdAt!: string;
  updatedAt!: string;
  subject?: { id: string; name: string } | null;
  class?: { id: string; name: string } | null;
}
