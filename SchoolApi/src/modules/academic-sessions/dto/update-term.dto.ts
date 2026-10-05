import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { IsOptionalDateOnly } from '../../../core/common/validation/is-date-only';

export class UpdateTermDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(40)
  name?: string;

  @IsOptionalDateOnly()
  startDate?: string;

  @IsOptionalDateOnly()
  endDate?: string;
}
