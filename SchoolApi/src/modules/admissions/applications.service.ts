import { Injectable } from '@nestjs/common';
import type { Prisma } from '../../generated/prisma/client';
import { AuditService } from '../../core/audit/audit.service';
import { invalid } from '../../core/common/errors/errors';
import type { PageResult } from '../../core/common/pagination/page-result';
import { toPageResult } from '../../core/common/pagination/paginate';
import { toJson } from '../../core/common/prisma-json';
import type { AuthUser } from '../../core/common/types/auth-user';
import { PrismaService } from '../../core/prisma/prisma.service';
import type { Scope } from '../../core/rbac/scope/scope';
import {
  formatNumber,
  SequenceService,
} from '../../core/sequences/sequence.service';
import { DocumentsService } from '../documents/documents.service';
import type { AttachDocumentDto } from '../documents/dto/document-input.dto';
import type { DocumentDto } from '../documents/dto/document.dto';
import { assertOnePrimary } from '../students/registration/guardian-writer';
import { fullName } from '../students/student.mapper';
import { ApplicationAccessService } from './application-access.service';
import { toApplicationDto } from './application.mapper';
import {
  ApplicationsRepository,
  APPLICATION_INCLUDE,
  type ApplicationRow,
} from './applications.repository';
import {
  EDITABLE_STATUSES,
  OPEN_STATUSES,
  type ApplicationInputDto,
  type ApplicationQueryDto,
  type UpdateApplicationDto,
} from './dto/application-input.dto';
import type { ApplicationDto } from './dto/application.dto';

@Injectable()
export class ApplicationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly repository: ApplicationsRepository,
    private readonly access: ApplicationAccessService,
    private readonly sequences: SequenceService,
    private readonly documents: DocumentsService,
    private readonly audit: AuditService,
  ) {}

  async list(
    scope: Scope,
    query: ApplicationQueryDto,
  ): Promise<PageResult<ApplicationDto>> {
    const { rows, total } = await this.repository.list(scope, query);
    return toPageResult(
      rows.map((row) => toApplicationDto(row, [])),
      total,
      query,
    );
  }

  async get(scope: Scope, id: string): Promise<ApplicationDto> {
    return this.access.toDto(await this.access.load(scope, id));
  }

  async create(
    user: AuthUser,
    scope: Scope,
    dto: ApplicationInputDto,
    tx?: Prisma.TransactionClient,
  ): Promise<ApplicationRow> {
    assertOnePrimary(dto.guardians);
    const db = tx ?? this.prisma;
    const session = await db.academicSession.findUnique({
      where: { id: dto.sessionId },
    });
    if (!session || session.branchId !== dto.branchId)
      throw invalid('Session does not belong to the branch');
    scope.assertManageBranch({
      id: session.branchId,
      schoolId: session.schoolId,
    });
    const schoolClass = await db.schoolClass.findUnique({
      where: { id: dto.classId },
    });
    if (!schoolClass || schoolClass.schoolId !== session.schoolId)
      throw invalid('Class does not belong to the school');

    const run = async (t: Prisma.TransactionClient) => {
      const year = new Date().getUTCFullYear();
      const seq = await this.sequences.next(
        t,
        `application:${dto.branchId}:${year}`,
      );
      return t.admissionApplication.create({
        data: {
          schoolId: session.schoolId,
          branchId: dto.branchId,
          sessionId: dto.sessionId,
          classId: dto.classId,
          applicationNo: formatNumber('APP', year, seq),
          childName: fullName(dto.child),
          child: toJson(dto.child),
          guardians: toJson(dto.guardians),
          medical: dto.medical ? toJson(dto.medical) : undefined,
          notes: dto.notes,
          createdById: user.id,
        },
        include: APPLICATION_INCLUDE,
      });
    };
    const row = tx ? await run(tx) : await this.prisma.$transaction(run);
    this.audit.stage({
      action: 'application.create',
      entityType: 'AdmissionApplication',
      entityId: row.id,
      schoolId: row.schoolId,
      branchId: row.branchId,
      after: { applicationNo: row.applicationNo, childName: row.childName },
    });
    return row;
  }

  async update(
    user: AuthUser,
    scope: Scope,
    id: string,
    dto: UpdateApplicationDto,
  ): Promise<ApplicationDto> {
    const before = await this.access.loadIn(scope, id, EDITABLE_STATUSES);
    if (dto.guardians) assertOnePrimary(dto.guardians);
    const row = await this.repository.update(id, {
      child: dto.child ? toJson(dto.child) : undefined,
      childName: dto.child ? fullName(dto.child) : undefined,
      guardians: dto.guardians ? toJson(dto.guardians) : undefined,
      medical: dto.medical ? toJson(dto.medical) : undefined,
      notes: dto.notes,
      updatedById: user.id,
    });
    this.audit.stage({
      action: 'application.update',
      entityType: 'AdmissionApplication',
      entityId: id,
      schoolId: row.schoolId,
      branchId: row.branchId,
      before: {
        child: before.child,
        guardians: before.guardians,
        notes: before.notes,
      },
      after: { child: row.child, guardians: row.guardians, notes: row.notes },
    });
    return this.access.toDto(row);
  }

  async attachDocument(
    user: AuthUser,
    scope: Scope,
    id: string,
    dto: AttachDocumentDto,
  ): Promise<DocumentDto> {
    await this.access.loadIn(scope, id, EDITABLE_STATUSES);
    return this.documents.create(user, scope, {
      ...dto,
      ownerType: 'APPLICATION',
      ownerId: id,
    });
  }

  async withdraw(
    user: AuthUser,
    scope: Scope,
    id: string,
    reason: string,
  ): Promise<ApplicationDto> {
    const before = await this.access.loadIn(scope, id, OPEN_STATUSES);
    const row = await this.repository.update(id, {
      status: 'WITHDRAWN',
      withdrawReason: reason,
      waitlistPosition: null,
      updatedById: user.id,
    });
    this.audit.stage({
      action: 'application.withdraw',
      entityType: 'AdmissionApplication',
      entityId: id,
      schoolId: row.schoolId,
      branchId: row.branchId,
      before: { status: before.status },
      after: { status: row.status, reason },
    });
    return this.access.toDto(row);
  }
}
