import type { CalendarEventType } from '../../../generated/prisma/client';

export class CalendarEventDto {
  id!: string;
  schoolId!: string;
  /** null = whole school */
  branchId!: string | null;
  type!: CalendarEventType;
  title!: string;
  startDate!: string;
  endDate!: string;
  description!: string | null;
}
