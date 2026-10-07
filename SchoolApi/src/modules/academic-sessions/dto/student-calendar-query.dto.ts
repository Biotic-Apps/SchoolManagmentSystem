import { IsOptionalDateOnly } from '../../../core/common/validation/is-date-only';

export class StudentCalendarQueryDto {
  /** Default: today in the school's time zone. */
  @IsOptionalDateOnly()
  from?: string;

  /** Default: `from` + 90 days. At most 366 days after `from`. */
  @IsOptionalDateOnly()
  to?: string;
}
