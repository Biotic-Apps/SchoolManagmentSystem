import type { CalendarEvent } from '../../../generated/prisma/client';
import { formatDate } from '../../../core/common/dates';
import type { CalendarEventDto } from '../dto/calendar-event.dto';

export function toCalendarEventDto(row: CalendarEvent): CalendarEventDto {
  return {
    id: row.id,
    schoolId: row.schoolId,
    branchId: row.branchId,
    type: row.type,
    title: row.title,
    startDate: formatDate(row.startDate),
    endDate: formatDate(row.endDate),
    description: row.description,
  };
}
