import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { IsOptionalDateOnly } from '../../../core/common/validation/is-date-only';

export class UpdateSessionDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(30)
  name?: string;

  @IsOptionalDateOnly()
  startDate?: string;

  @IsOptionalDateOnly()
  endDate?: string;
}
