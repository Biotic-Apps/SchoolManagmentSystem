import { Injectable } from '@nestjs/common';
import type { Subject } from '../../../generated/prisma/client';
import { AuditService } from '../../../core/audit/audit.service';
import { notFound } from '../../../core/common/errors/errors';
import type { PageResult } from '../../../core/common/pagination/page-result';
import { toPageResult } from '../../../core/common/pagination/paginate';
import type { AuthUser } from '../../../core/common/types/auth-user';
import type { Scope } from '../../../core/rbac/scope/scope';
import { toSubjectDto } from '../academics.mapper';
import type { CreateSubjectDto } from '../dto/create-subject.dto';
import type { SchoolQueryDto } from '../dto/school-query.dto';
import type { SubjectDto } from '../dto/subject.dto';
import type { UpdateSubjectDto } from '../dto/update-subject.dto';
import { onDuplicate } from '../unique-conflict';
import { SubjectsRepository } from './subjects.repository';

@Injectable()
export class SubjectsService {
  constructor(
    private readonly repository: SubjectsRepository,
    private readonly audit: AuditService,
  ) {}

  async list(
    scope: Scope,
    query: SchoolQueryDto,
  ): Promise<PageResult<SubjectDto>> {
    const { rows, total } = await this.repository.list(scope, query);
    return toPageResult(rows.map(toSubjectDto), total, query);
  }

  async create(
    user: AuthUser,
    scope: Scope,
    dto: CreateSubjectDto,
  ): Promise<SubjectDto> {
    scope.assertReadSchool(dto.schoolId);
    const row = await this.repository
      .create({ ...dto, name: dto.name.trim(), createdById: user.id })
      .catch(onDuplicate(`Subject code ${dto.code} already exists`));
    return this.audited('subject.create', undefined, row);
  }

  async update(
    user: AuthUser,
    scope: Scope,
    id: string,
    dto: UpdateSubjectDto,
  ): Promise<SubjectDto> {
    const before = await this.repository.findById(id);
    if (!before) throw notFound('Subject');
    scope.assertReadSchool(before.schoolId);
    const row = await this.repository
      .update(id, {
        code: dto.code,
        name: dto.name?.trim(),
        updatedById: user.id,
      })
      .catch(onDuplicate(`Subject code ${dto.code} already exists`));
    return this.audited('subject.update', before, row);
  }

  private audited(
    action: string,
    before: Subject | undefined,
    after: Subject,
  ): SubjectDto {
    const dto = toSubjectDto(after);
    this.audit.stage({
      action,
      entityType: 'Subject',
      entityId: after.id,
      schoolId: after.schoolId,
      before: before && toSubjectDto(before),
      after: dto,
    });
    return dto;
  }
}
