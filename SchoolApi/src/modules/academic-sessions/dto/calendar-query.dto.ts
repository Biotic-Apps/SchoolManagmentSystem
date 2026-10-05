import { IsOptional, IsUUID } from 'class-validator';
import { IsOptionalDateOnly } from '../../../core/common/validation/is-date-only';

export class CalendarQueryDto {
  @IsOptional()
  @IsUUID()
  branchId?: string;

  @IsOptionalDateOnly()
  from?: string;

  @IsOptionalDateOnly()
  to?: string;
}
