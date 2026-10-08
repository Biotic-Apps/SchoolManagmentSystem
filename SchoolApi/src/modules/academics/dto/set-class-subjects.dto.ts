import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayUnique,
  IsArray,
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';

export class ClassSubjectItemInput {
  @IsUUID()
  subjectId!: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(20)
  periodsPerWeek?: number | null;

  @IsOptional()
  @IsBoolean()
  isOptional?: boolean;

  /** null/blank = all sections. */
  @IsOptional()
  @IsString()
  @MaxLength(30)
  group?: string | null;
}

/** PUT /classes/:id/subjects: `items` (order = sortOrder) or the legacy `subjectIds`. */
export class SetClassSubjectsDto {
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(50)
  @ValidateNested({ each: true })
  @Type(() => ClassSubjectItemInput)
  items?: ClassSubjectItemInput[];

  /** Legacy: keeps periods/group of subjects that stay. */
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @ArrayMaxSize(50)
  @IsUUID('all', { each: true })
  subjectIds?: string[];
}

export class ReorderClassesDto {
  /** Every active class of the school, in the new order. */
  @IsArray()
  @ArrayUnique()
  @ArrayMaxSize(100)
  @IsUUID('all', { each: true })
  classIds!: string[];
}
