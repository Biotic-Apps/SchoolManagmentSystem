import { Injectable } from '@nestjs/common';
import { forbiddenScope, notFound } from '../../core/common/errors/errors';
import type { Scope } from '../../core/rbac/scope/scope';
import { canReadStudent, currentEnrollment } from './student-scope';
import { StudentsRepository, type StudentRow } from './students.repository';

/** Single-record checks (security.md §2.5): parents get 404, others 403. */
@Injectable()
export class StudentAccessService {
  constructor(private readonly repository: StudentsRepository) {}

  async read(scope: Scope, studentId: string): Promise<StudentRow> {
    const row = await this.repository.findById(studentId);
    if (!row) throw notFound('Student');
    if (!canReadStudent(scope, row.id, row.enrollments)) {
      throw scope.guardian ? notFound('Student') : forbiddenScope();
    }
    return row;
  }

  /** Changes need management scope over the student's current branch. */
  async manage(scope: Scope, studentId: string): Promise<StudentRow> {
    const row = await this.read(scope, studentId);
    const current = currentEnrollment(row.enrollments);
    const managed = current
      ? scope.canManageBranch({
          id: current.branchId,
          schoolId: current.schoolId,
        })
      : scope.canManageSchool(row.schoolId);
    if (!managed) throw forbiddenScope();
    return row;
  }
}
