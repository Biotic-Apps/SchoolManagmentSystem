import { IsString, MaxLength, MinLength } from 'class-validator';
import { IsDateOnly } from '../../../core/common/validation/is-date-only';

export class CreateTermDto {
  @IsString()
  @MinLength(1)
  @MaxLength(40)
  name!: string;

  @IsDateOnly()
  startDate!: string;

  @IsDateOnly()
  endDate!: string;
}
