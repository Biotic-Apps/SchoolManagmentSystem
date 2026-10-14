import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
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

  @IsString()
  @MinLength(1)
  @MaxLength(5000)
  questionText!: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  options?: string[];

  @IsString()
  @MinLength(1)
  @MaxLength(2000)
  correctAnswer!: string;
}

export class UpdateQuestionDto {
  @IsOptional()
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
  @IsString()
  @MinLength(1)
  @MaxLength(5000)
  questionText?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  options?: string[];

  @IsOptional()
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
