import { PeriodDto } from './timetable.dto';

export class BellScheduleDto {
  workingDays!: number[];
  default!: PeriodDto[];
  /** Weekday-specific schedules keyed "1".."7", e.g. "5" = Friday. */
  days!: Record<string, PeriodDto[]>;
}
