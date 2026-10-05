import {
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { CalendarEventType } from '../../../generated/prisma/client';
import { IsOptionalDateOnly } from '../../../core/common/validation/is-date-only';

export class UpdateCalendarEventDto {
  @IsOptional()
  @IsIn(Object.values(CalendarEventType))
  type?: CalendarEventType;

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  title?: string;

  @IsOptionalDateOnly()
  startDate?: string;

  @IsOptionalDateOnly()
  endDate?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;
}
