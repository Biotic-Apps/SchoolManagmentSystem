import {
  IsIn,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';
import { CalendarEventType } from '../../../generated/prisma/client';
import { IsDateOnly } from '../../../core/common/validation/is-date-only';

export class CreateCalendarEventDto {
  @IsUUID()
  schoolId!: string;

  /** Omit for a whole-school event. */
  @IsOptional()
  @IsUUID()
  branchId?: string;

  @IsIn(Object.values(CalendarEventType))
  type!: CalendarEventType;

  @IsString()
  @MinLength(2)
  @MaxLength(120)
  title!: string;

  @IsDateOnly()
  startDate!: string;

  @IsDateOnly()
  endDate!: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;
}
