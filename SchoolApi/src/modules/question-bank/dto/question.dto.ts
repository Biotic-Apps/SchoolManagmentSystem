import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  ArrayMaxSize,
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
import {
  DifficultyLevel,
  QuestionType,
} from '../../../generated/prisma/client';
import { PaginationQueryDto } from '../../../core/common/pagination/pagination-query.dto';
import { Trim } from '../../../core/common/validation/trim';
import { MCQ_MAX_OPTIONS } from '../question-rules';

/** Trims every option before validation ("  " is not an option). */
const TrimEach = () =>
  Transform(({ value }: { value: unknown }) =>
    Array.isArray(value)
      ? value.map((v: unknown) => (typeof v === 'string' ? v.trim() : v))
      : value,
  );

export class QuestionQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsUUID()
  schoolId?: string;

  @IsOptional()
  @IsUUID()
  subjectId?: string;

  @IsOptional()
  @IsUUID()
  classId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  chapterName?: string;

  @ApiPropertyOptional({ enum: QuestionType })
  @IsOptional()
  @IsIn(Object.values(QuestionType))
  questionType?: QuestionType;

  @ApiPropertyOptional({ enum: DifficultyLevel })
  @IsOptional()
  @IsIn(Object.values(DifficultyLevel))
  difficultyLevel?: DifficultyLevel;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  search?: string;

  @IsOptional()
  @IsString()
  status?: string;
}

export class CreateQuestionDto {
  @IsUUID()
  schoolId!: string;

  @IsUUID()
  subjectId!: string;

  @IsUUID()
  classId!: string;

  @Trim()
  @IsString()
  @MinLength(1)
  @MaxLength(150)
  chapterName!: string;

  @ApiProperty({ enum: QuestionType })
  @IsIn(Object.values(QuestionType))
  questionType!: QuestionType;

  @ApiProperty({ enum: DifficultyLevel })
  @IsIn(Object.values(DifficultyLevel))
  difficultyLevel!: DifficultyLevel;

  @IsInt()
  @Min(1)
  @Max(100)
  marks!: number;

  @Trim()
  @IsString()
  @MinLength(1)
  @MaxLength(5000)
  questionText!: string;

  @IsOptional()
  @TrimEach()
  @IsArray()
  @ArrayMaxSize(MCQ_MAX_OPTIONS)
  @IsString({ each: true })
  @MaxLength(500, { each: true })
  options?: string[];

  @Trim()
  @IsString()
  @MinLength(1)
  @MaxLength(2000)
  correctAnswer!: string;
}

export class UpdateQuestionDto {
  @IsOptional()
  @Trim()
  @IsString()
  @MinLength(1)
  @MaxLength(150)
  chapterName?: string;

  @ApiPropertyOptional({ enum: QuestionType })
  @IsOptional()
  @IsIn(Object.values(QuestionType))
  questionType?: QuestionType;

  @ApiPropertyOptional({ enum: DifficultyLevel })
  @IsOptional()
  @IsIn(Object.values(DifficultyLevel))
  difficultyLevel?: DifficultyLevel;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  marks?: number;

  @IsOptional()
  @Trim()
  @IsString()
  @MinLength(1)
  @MaxLength(5000)
  questionText?: string;

  @IsOptional()
  @TrimEach()
  @IsArray()
  @ArrayMaxSize(MCQ_MAX_OPTIONS)
  @IsString({ each: true })
  @MaxLength(500, { each: true })
  options?: string[];

  @IsOptional()
  @Trim()
  @IsString()
  @MinLength(1)
  @MaxLength(2000)
  correctAnswer?: string;

  @IsOptional()
  @IsIn(['ACTIVE', 'ARCHIVED'])
  status?: 'ACTIVE' | 'ARCHIVED';
}

export class QuestionDto {
  id!: string;
  schoolId!: string;
  subjectId!: string;
  classId!: string;
  chapterName!: string;
  questionType!: string;
  difficultyLevel!: string;
  marks!: number;
  questionText!: string;
  options!: string[] | null;
  correctAnswer!: string;
  status!: string;
  createdById!: string;
  createdAt!: string;
  updatedAt!: string;
  subject?: { id: string; name: string } | null;
  class?: { id: string; name: string } | null;
}
