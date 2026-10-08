import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { LEVELS, type Level } from '../level-presets';

export class SetupSectionInput {
  @IsString()
  @MinLength(1)
  @MaxLength(10)
  name!: string;

  /** e.g. "Science" / "Arts". */
  @IsOptional()
  @IsString()
  @MaxLength(30)
  group?: string;
}

export class SetupSubjectInput {
  @IsString()
  @MinLength(1)
  @MaxLength(40)
  name!: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(20)
  periodsPerWeek?: number;

  /** Must match a section group of the class. */
  @IsOptional()
  @IsString()
  @MaxLength(30)
  group?: string;

  @IsOptional()
  @IsBoolean()
  isOptional?: boolean;
}

/** One class of the wizard (order = levelOrder). */
export class SetupClassInput {
  @IsString()
  @MinLength(1)
  @MaxLength(40)
  name!: string;

  @IsOptional()
  @IsIn(LEVELS)
  level?: Level;

  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(8)
  @ValidateNested({ each: true })
  @Type(() => SetupSectionInput)
  sections!: SetupSectionInput[];

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(40)
  @ValidateNested({ each: true })
  @Type(() => SetupSubjectInput)
  subjects?: SetupSubjectInput[];
}
