import {
  ArrayMaxSize,
  ArrayUnique,
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class CreateSubjectDto {
  @IsUUID()
  schoolId!: string;

  /** Optional: catalogue code for known names, else initials (suffixed 2, 3 … on clash). */
  @IsOptional()
  @Matches(/^[A-Z0-9_-]{1,12}$/, {
    message: 'code must be 1-12 uppercase letters, digits, _ or -',
  })
  code?: string;

  @IsString()
  @MinLength(2)
  @MaxLength(80)
  name!: string;

  /** Also add the subject to these classes' curriculum (appended last). */
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @ArrayMaxSize(50)
  @IsUUID('all', { each: true })
  classIds?: string[];

  /** periodsPerWeek of the new class links. */
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(20)
  periodsPerWeek?: number;
}
