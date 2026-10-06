import { Injectable } from '@nestjs/common';
import { AuditService } from '../../core/audit/audit.service';
import { requestContext } from '../../core/common/context/request-context';
import { parseDate } from '../../core/common/dates';
import { invalid } from '../../core/common/errors/errors';
import type { PageResult } from '../../core/common/pagination/page-result';
import { toPageResult } from '../../core/common/pagination/paginate';
import type { AuthUser } from '../../core/common/types/auth-user';
import { FileRefService } from '../../core/files/file-ref.service';
import { OutboxService } from '../../core/outbox/outbox.service';
import { PrismaService } from '../../core/prisma/prisma.service';
import { AccessCache } from '../../core/rbac/access/access-cache';
import type { Scope } from '../../core/rbac/scope/scope';
import { assertSessionOpen } from '../academic-sessions/session-lock';
import { DocumentsService } from '../documents/documents.service';
import type { RegisterStudentDto } from './dto/register-student.dto';
import type {
  EnrollmentDto,
  StudentDetailDto,
  StudentSummaryDto,
} from './dto/student.dto';
import type { StudentQueryDto } from './dto/student-query.dto';
import type { UpdateStudentDto } from './dto/update-student.dto';
import { assertOnePrimary } from './registration/guardian-writer';
import { StudentRegistrationService } from './registration/student-registration.service';
import { StudentAccessService } from './student-access.service';
import { StudentMapper, toEnrollmentDto } from './student.mapper';
import { StudentsRepository, type StudentRow } from './students.repository';

@Injectable()
export class StudentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly repository: StudentsRepository,
    private readonly access: StudentAccessService,
    private readonly mapper: StudentMapper,
    private readonly registration: StudentRegistrationService,
    private readonly documents: DocumentsService,
    private readonly files: FileRefService,
    private readonly outbox: OutboxService,
    private readonly accessCache: AccessCache,
    private readonly audit: AuditService,
  ) {}

  async list(
    scope: Scope,
    query: StudentQueryDto,
  ): Promise<PageResult<StudentSummaryDto>> {
    const { rows, total } = await this.repository.list(scope, query);
    return toPageResult(
      rows.map((row) => this.mapper.toSummary(row)),
      total,
      query,
    );
  }

  async get(
    user: AuthUser,
    scope: Scope,
    id: string,
  ): Promise<StudentDetailDto> {
    return this.detail(user, scope, await this.access.read(scope, id));
  }

  async register(
    user: AuthUser,
    scope: Scope,
    dto: RegisterStudentDto,
  ): Promise<StudentDetailDto> {
    const section = await this.repository.findSection(dto.sectionId);
    if (!section) throw invalid('Section not found');
    scope.assertManageBranch({
      id: section.branchId,
      schoolId: section.schoolId,
    });
    assertSessionOpen(section.session);
    assertOnePrimary(dto.guardians);
    if (dto.child.photoFileId) {
      await this.files.assertUsable(dto.child.photoFileId, {
        schoolId: section.schoolId,
        userId: user.id,
        purposes: ['STUDENT_PHOTO'],
      });
    }
    const result = await this.prisma.$transaction((tx) =>
      this.registration.register(tx, {
        schoolId: section.schoolId,
        schoolCode: section.school.code,
        sectionId: section.id,
        admissionDate: dto.admissionDate,
        child: dto.child,
        guardians: dto.guardians,
        medical: dto.medical,
        actorId: user.id,
      }),
    );
    await this.outbox.publish(result.outboxIds);
    await Promise.all(
      result.guardianUserIds.map((id) => this.accessCache.invalidateUser(id)),
    );
    this.audit.stage({
      action: 'student.register',
      entityType: 'Student',
      entityId: result.studentId,
      schoolId: section.schoolId,
      branchId: section.branchId,
      after: {
        admissionNo: result.admissionNo,
        sectionId: section.id,
        admissionDate: dto.admissionDate,
      },
    });
    return this.get(user, scope, result.studentId);
  }

  async update(
    user: AuthUser,
    scope: Scope,
    id: string,
    dto: UpdateStudentDto,
  ): Promise<StudentDetailDto> {
    const before = await this.access.manage(scope, id);
    if (dto.photoFileId) {
      await this.files.assertUsable(dto.photoFileId, {
        schoolId: before.schoolId,
        userId: user.id,
        purposes: ['STUDENT_PHOTO'],
      });
    }
    const row = await this.repository.update(id, {
      firstName: dto.firstName?.trim(),
      lastName: dto.lastName?.trim(),
      dob: dto.dob ? parseDate(dto.dob) : undefined,
      gender: dto.gender,
      bForm: dto.bForm,
      photoFileId: dto.photoFileId,
      address: dto.address,
      updatedById: user.id,
    });
    this.audit.stage({
      action: 'student.update',
      entityType: 'Student',
      entityId: id,
      schoolId: row.schoolId,
      branchId: row.enrollments[0]?.branchId,
      before: this.snapshot(before),
      after: this.snapshot(row),
    });
    return this.detail(user, scope, row);
  }

  async enrollments(scope: Scope, id: string): Promise<EnrollmentDto[]> {
    await this.access.read(scope, id);
    const rows = await this.repository.enrollments(id);
    return rows.map(toEnrollmentDto);
  }

  private async detail(
    user: AuthUser,
    scope: Scope,
    row: StudentRow,
  ): Promise<StudentDetailDto> {
    const medical = user.permissions.has('health.view');
    const [links, documents, health] = await Promise.all([
      this.repository.guardianLinks(row.id, scope.guardian),
      this.documents.listForOwner('STUDENT', row.id),
      medical ? this.repository.healthProfile(row.id) : null,
    ]);
    if (health) await this.logMedicalRead(row);
    return this.mapper.toDetail(row, {
      links,
      documents,
      health,
      sensitive: user.permissions.has('people.sensitive.view'),
      medical,
    });
  }

  /** security.md §9: reads of medical data are audited. */
  private async logMedicalRead(row: StudentRow): Promise<void> {
    await this.audit.write(
      [
        {
          action: 'student.medical_view',
          entityType: 'Student',
          entityId: row.id,
          schoolId: row.schoolId,
          branchId: row.enrollments[0]?.branchId,
        },
      ],
      requestContext.getStore() ?? {},
    );
  }

  private snapshot(row: StudentRow) {
    return {
      firstName: row.firstName,
      lastName: row.lastName,
      dob: row.dob,
      gender: row.gender,
      bForm: row.bForm,
      photoFileId: row.photoFileId,
      address: row.address,
    };
  }
}
