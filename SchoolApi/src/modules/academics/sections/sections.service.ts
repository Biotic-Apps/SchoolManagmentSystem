import { Injectable } from '@nestjs/common';
import { AuditService } from '../../../core/audit/audit.service';
import {
  forbiddenScope,
  invalid,
  notFound,
} from '../../../core/common/errors/errors';
import type { PageResult } from '../../../core/common/pagination/page-result';
import { toPageResult } from '../../../core/common/pagination/paginate';
import type { AuthUser } from '../../../core/common/types/auth-user';
import type { Scope } from '../../../core/rbac/scope/scope';
import { assertSessionOpen } from '../../academic-sessions/session-lock';
import type { CreateSectionDto } from '../dto/create-section.dto';
import type { SectionDto } from '../dto/section.dto';
import type { SectionQueryDto } from '../dto/section-query.dto';
import type { UpdateSectionDto } from '../dto/update-section.dto';
import { onDuplicate } from '../unique-conflict';
import { toSectionDto } from './section.mapper';
import { SectionsRepository, type SectionRow } from './sections.repository';

@Injectable()
export class SectionsService {
  constructor(
    private readonly repository: SectionsRepository,
    private readonly audit: AuditService,
  ) {}

  async list(
    scope: Scope,
    query: SectionQueryDto,
  ): Promise<PageResult<SectionDto>> {
    const { rows, total } = await this.repository.list(scope, query);
    return toPageResult(rows.map(toSectionDto), total, query);
  }

  async create(
    user: AuthUser,
    scope: Scope,
    dto: CreateSectionDto,
  ): Promise<SectionDto> {
    const session = await this.repository.findSession(dto.sessionId);
    if (!session || session.branchId !== dto.branchId)
      throw invalid('Session does not belong to the branch');
    scope.assertManageBranch({
      id: session.branchId,
      schoolId: session.schoolId,
    });
    assertSessionOpen(session);
    const schoolClass = await this.repository.findClass(dto.classId);
    if (!schoolClass || schoolClass.schoolId !== session.schoolId)
      throw invalid('Class does not belong to the school');
    await this.assertRoom(dto.roomId, dto.branchId);

    const row = await this.repository
      .create({
        schoolId: session.schoolId,
        branchId: dto.branchId,
        sessionId: dto.sessionId,
        classId: dto.classId,
        name: dto.name.trim(),
        capacity: dto.capacity,
        roomId: dto.roomId,
        createdById: user.id,
      })
      .catch(
        onDuplicate(
          `Section ${dto.name} already exists for this class and session`,
        ),
      );
    return this.audited('section.create', undefined, row);
  }

  async update(
    user: AuthUser,
    scope: Scope,
    id: string,
    dto: UpdateSectionDto,
  ): Promise<SectionDto> {
    const before = await this.managed(scope, id);
    await this.assertRoom(dto.roomId, before.branchId);
    const row = await this.repository
      .update(id, {
        name: dto.name?.trim(),
        capacity: dto.capacity,
        roomId: dto.roomId,
        updatedById: user.id,
      })
      .catch(
        onDuplicate(
          `Section ${dto.name} already exists for this class and session`,
        ),
      );
    return this.audited('section.update', before, row);
  }

  async archive(user: AuthUser, scope: Scope, id: string): Promise<SectionDto> {
    const before = await this.managed(scope, id);
    const row = await this.repository.update(id, {
      status: 'ARCHIVED',
      updatedById: user.id,
    });
    return this.audited('section.archive', before, row);
  }

  private async managed(scope: Scope, id: string): Promise<SectionRow> {
    const row = await this.repository.findById(id);
    if (!row) throw notFound('Section');
    if (!scope.canManageBranch({ id: row.branchId, schoolId: row.schoolId }))
      throw forbiddenScope();
    assertSessionOpen(row.session);
    return row;
  }

  private async assertRoom(
    roomId: string | undefined,
    branchId: string,
  ): Promise<void> {
    if (!roomId) return;
    const room = await this.repository.findRoom(roomId);
    if (!room || room.branchId !== branchId)
      throw invalid('Room does not belong to the branch');
  }

  private audited(
    action: string,
    before: SectionRow | undefined,
    after: SectionRow,
  ): SectionDto {
    const dto = toSectionDto(after);
    this.audit.stage({
      action,
      entityType: 'Section',
      entityId: after.id,
      schoolId: after.schoolId,
      branchId: after.branchId,
      before: before && toSectionDto(before),
      after: dto,
    });
    return dto;
  }
}
