import { Injectable } from '@nestjs/common';
import { schoolDate } from '../../../core/common/school-time';
import type { Scope } from '../../../core/rbac/scope/scope';
import { StudentAccessService } from '../../students/student-access.service';
import { currentEnrollment } from '../../students/student-scope';
import type { CalendarEventDto } from '../dto/calendar-event.dto';
import type { StudentCalendarQueryDto } from '../dto/student-calendar-query.dto';
import { resolveCalendarRange } from './calendar-range';
import { toCalendarEventDto } from './calendar.mapper';
import { CalendarRepository } from './calendar.repository';

/** School calendar of a student's current branch (parents and staff). */
@Injectable()
export class StudentCalendarService {
  constructor(
    private readonly students: StudentAccessService,
    private readonly repository: CalendarRepository,
  ) {}

  async list(
    scope: Scope,
    studentId: string,
    query: StudentCalendarQueryDto,
  ): Promise<CalendarEventDto[]> {
    const range = resolveCalendarRange(schoolDate(), query.from, query.to);
    // Parents: verified link, else 404. Staff: student in scope, else 403.
    const student = await this.students.read(scope, studentId);
    const enrollment = currentEnrollment(student.enrollments);
    if (!enrollment) return [];
    const rows = await this.repository.listForBranch(
      { id: enrollment.branchId, schoolId: enrollment.schoolId },
      range.from,
      range.to,
    );
    return rows.map(toCalendarEventDto);
  }
}
