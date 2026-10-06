import {
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { IsDateOnly } from '../../../core/common/validation/is-date-only';

export class WithdrawStudentDto {
  @IsDateOnly()
  effectiveDate!: string;

  @IsString()
  @MinLength(3)
  @MaxLength(500)
  reason!: string;
}

export class ChangeSectionDto {
  @IsUUID()
  sectionId!: string;

  @IsDateOnly()
  effectiveDate!: string;

  @IsString()
  @MinLength(3)
  @MaxLength(500)
  reason!: string;

  /** Omit to take the next free roll number of the target section. */
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(999)
  rollNo?: number;
}
