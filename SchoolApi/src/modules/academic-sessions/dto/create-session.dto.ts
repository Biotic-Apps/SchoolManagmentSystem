import { IsString, IsUUID, MaxLength, MinLength } from 'class-validator';
import { IsDateOnly } from '../../../core/common/validation/is-date-only';

export class CreateSessionDto {
  @IsUUID()
  branchId!: string;

  /** e.g. "2026-27" */
  @IsString()
  @MinLength(2)
  @MaxLength(30)
  name!: string;

  @IsDateOnly()
  startDate!: string;

  @IsDateOnly()
  endDate!: string;
}
