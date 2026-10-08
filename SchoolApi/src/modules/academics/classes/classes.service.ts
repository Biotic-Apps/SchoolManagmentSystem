import { Injectable } from '@nestjs/common';
import { AuditService } from '../../../core/audit/audit.service';
import { notFound } from '../../../core/common/errors/errors';
import type { PageResult } from '../../../core/common/pagination/page-result';
import { toPageResult } from '../../../core/common/pagination/paginate';
import type { AuthUser } from '../../../core/common/types/auth-user';
import type { Scope } from '../../../core/rbac/scope/scope';
import { toClassDto, toSubjectDto } from '../academics.mapper';
import type { CreateClassDto } from '../dto/create-class.dto';
import type { SchoolClassDto } from '../dto/school-class.dto';
import type { SchoolQueryDto } from '../dto/school-query.dto';
import type { SubjectDto } from '../dto/subject.dto';
import type { UpdateClassDto } from '../dto/update-class.dto';
import { SchoolDataAccess } from '../school-data-access';
import { onDuplicate } from '../unique-conflict';
import { ClassesRepository, type ClassRow } from './classes.repository';

@Injectable()
export class ClassesService {
  constructor(
    private readonly repository: ClassesRepository,
    private readonly access: SchoolDataAccess,
    private readonly audit: AuditService,
  ) {}

  async list(
    scope: Scope,
    query: SchoolQueryDto,
  ): Promise<PageResult<SchoolClassDto>> {
    const { rows, total } = await this.repository.list(scope, query);
    return toPageResult(rows.map(toClassDto), total, query);
  }

  async create(
    user: AuthUser,
    scope: Scope,
    dto: CreateClassDto,
  ): Promise<SchoolClassDto> {
    await this.access.assertManage(scope, dto.schoolId);
    const row = await this.repository
      .create({ ...dto, name: dto.name.trim(), createdById: user.id })
      .catch(onDuplicate(`Class ${dto.name} already exists`));
    return this.audited('class.create', undefined, row);
  }

  async update(
    user: AuthUser,
    scope: Scope,
    id: string,
    dto: UpdateClassDto,
  ): Promise<SchoolClassDto> {
    const before = await this.find(scope, id);
    await this.access.assertManage(scope, before.schoolId);
    const row = await this.repository
      .update(id, {
        name: dto.name?.trim(),
        levelOrder: dto.levelOrder,
        updatedById: user.id,
      })
      .catch(onDuplicate(`Class ${dto.name} already exists`));
    return this.audited('class.update', before, row);
  }

  async subjects(scope: Scope, id: string): Promise<SubjectDto[]> {
    await this.find(scope, id);
    return (await this.repository.subjectsOf(id)).map(toSubjectDto);
  }

  private async find(scope: Scope, id: string): Promise<ClassRow> {
    const row = await this.repository.findById(id);
    if (!row) throw notFound('Class');
    scope.assertReadSchool(row.schoolId);
    return row;
  }

  private audited(
    action: string,
    before: ClassRow | undefined,
    after: ClassRow,
  ): SchoolClassDto {
    const dto = toClassDto(after);
    this.audit.stage({
      action,
      entityType: 'SchoolClass',
      entityId: after.id,
      schoolId: after.schoolId,
      before: before && toClassDto(before),
      after: dto,
    });
    return dto;
  }
}
