import { formatDate } from '../../core/common/dates';
import { forbidden, invalid } from '../../core/common/errors/errors';
import type { StaffEntryInputDto } from './dto/staff-attendance.dto';

const NO_TIMES = new Set(['ABSENT', 'LEAVE']);

export interface StaffRef {
  id: string;
  name: string;
  joinDate: Date;
}

/**
 * Row checks of a staff register save (feeds payroll, backendFlows §7.2):
 * nobody marks their own row (no self-approval), no days before the staff
 * member joined, no times on ABSENT / LEAVE, check-out not before check-in.
 */
export function assertStaffEntries(
  entries: StaffEntryInputDto[],
  staff: Map<string, StaffRef>,
  date: Date,
  actorStaffId: string | null,
): void {
  for (const entry of entries) {
    const person = staff.get(entry.staffId);
    if (!person) throw invalid('Staff must belong to this branch');
    if (actorStaffId && entry.staffId === actorStaffId)
      throw forbidden('You cannot mark your own attendance');
    if (date < person.joinDate)
      throw invalid(
        `${person.name} joined on ${formatDate(person.joinDate)}; attendance cannot be marked before that`,
      );
    if (NO_TIMES.has(entry.status) && (entry.checkIn || entry.checkOut))
      throw invalid(
        `${person.name}: check-in / check-out times are only for staff who were at school`,
      );
    if (entry.checkIn && entry.checkOut && entry.checkOut < entry.checkIn)
      throw invalid(`${person.name}: check-out cannot be before check-in`);
  }
}

/** Unmarked days stop at today: future working days are not "unmarked". */
export function capAtToday(to: Date, today: Date): Date {
  return to > today ? today : to;
}
