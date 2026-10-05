import { Injectable } from '@nestjs/common';
import { AuditService } from '../../core/audit/audit.service';
import { parseDate } from '../../core/common/dates';
import { conflict, invalid, notFound } from '../../core/common/errors/errors';
import type { PageResult } from '../../core/common/pagination/page-result';
import { toPageResult } from '../../core/common/pagination/paginate';
import type { AuthUser } from '../../core/common/types/auth-user';
import { assertDateRange } from '../../core/common/validation/date-range';
import type { Scope } from '../../core/rbac/scope/scope';
import type { AcademicSessionDto } from './dto/academic-session.dto';
import type { CreateSessionDto } from './dto/create-session.dto';
import type { SessionQueryDto } from './dto/session-query.dto';
import type { UpdateSessionDto } from './dto/update-session.dto';
import { assertSessionOpen } from './session-lock';
import { toSessionDto } from './session.mapper';
import { SessionsRepository, type SessionRow } from './sessions.repository';

const isUniqueViolation = (error: unknown) =>
  (error as { code?: string }).code === 'P2002';

@Injectable()
export class SessionsService {
  constructor(
    private readonly repository: SessionsRepository,
    private readonly audit: AuditService,
  ) {}

  async list(
    scope: Scope,
    query: SessionQueryDto,
  ): Promise<PageResult<AcademicSessionDto>> {
    const { rows, total } = await this.repository.list(scope, query);
    return toPageResult(rows.map(toSessionDto), total, query);
  }

  /** Session readable in scope (shared with terms and sections). */
  async find(scope: Scope, id: string): Promise<SessionRow> {
    const row = await this.repository.findById(id);
    if (!row) throw notFound('Academic session');
    scope.assertReadBranch({ id: row.branchId, schoolId: row.schoolId });
    return row;
  }

  async create(
    user: AuthUser,
    scope: Scope,
    dto: CreateSessionDto,
  ): Promise<AcademicSessionDto> {
    const branch = await this.repository.findBranch(dto.branchId);
    if (!branch) throw invalid('Branch does not exist');
    scope.assertManageBranch(branch);
    const startDate = parseDate(dto.startDate);
    const endDate = parseDate(dto.endDate);
    assertDateRange(startDate, endDate);
    const row = await this.repository
      .create({
        schoolId: branch.schoolId,
        branchId: branch.id,
        name: dto.name.trim(),
        startDate,
        endDate,
        createdById: user.id,
      })
      .catch((error: unknown) => {
        if (isUniqueViolation(error))
          throw conflict(`Session ${dto.name} already exists in this branch`);
        throw error;
      });
    return this.audited('session.create', undefined, row);
  }

  async update(
    user: AuthUser,
    scope: Scope,
    id: string,
    dto: UpdateSessionDto,
  ): Promise<AcademicSessionDto> {
    const before = await this.managed(scope, id);
    assertSessionOpen(before);
    const startDate = dto.startDate
      ? parseDate(dto.startDate)
      : before.startDate;
    const endDate = dto.endDate ? parseDate(dto.endDate) : before.endDate;
    assertDateRange(startDate, endDate);
    const row = await this.repository.update(id, {
      name: dto.name?.trim(),
      startDate,
      endDate,
      updatedById: user.id,
    });
    return this.audited('session.update', before, row);
  }

  async activate(
    user: AuthUser,
    scope: Scope,
    id: string,
  ): Promise<AcademicSessionDto> {
    const before = await this.managed(scope, id);
    assertSessionOpen(before);
    if (before.status === 'ACTIVE') return toSessionDto(before);
    const other = await this.repository.activeInBranch(before.branchId);
    if (other)
      throw conflict(`Session ${other.name} is already active in this branch`);
    const row = await this.repository
      .update(id, { status: 'ACTIVE', updatedById: user.id })
      .catch((error: unknown) => {
        if (isUniqueViolation(error))
          throw conflict('Another session is already active in this branch');
        throw error;
      });
    return this.audited('session.activate', before, row);
  }

  async close(
    user: AuthUser,
    scope: Scope,
    id: string,
  ): Promise<AcademicSessionDto> {
    const before = await this.managed(scope, id);
    assertSessionOpen(before);
    if (before.status !== 'ACTIVE')
      throw invalid('Only an ACTIVE session can be closed');
    const row = await this.repository.update(id, {
      status: 'CLOSED',
      updatedById: user.id,
    });
    return this.audited('session.close', before, row);
  }

  async managed(scope: Scope, id: string): Promise<SessionRow> {
    const row = await this.find(scope, id);
    scope.assertManageBranch({ id: row.branchId, schoolId: row.schoolId });
    return row;
  }

  private audited(
    action: string,
    before: SessionRow | undefined,
    after: SessionRow,
  ): AcademicSessionDto {
    const dto = toSessionDto(after);
    this.audit.stage({
      action,
      entityType: 'AcademicSession',
      entityId: after.id,
      schoolId: after.schoolId,
      branchId: after.branchId,
      before: before && toSessionDto(before),
      after: dto,
    });
    return dto;
  }
}
