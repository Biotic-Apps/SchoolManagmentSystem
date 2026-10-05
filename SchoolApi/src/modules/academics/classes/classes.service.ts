import { Injectable } from '@nestjs/common';
import { AuditService } from '../../../core/audit/audit.service';
import { invalid, notFound } from '../../../core/common/errors/errors';
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
import { onDuplicate } from '../unique-conflict';
import { ClassesRepository, type ClassRow } from './classes.repository';

@Injectable()
export class ClassesService {
  constructor(
    private readonly repository: ClassesRepository,
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
    scope.assertReadSchool(dto.schoolId);
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

  async setSubjects(
    scope: Scope,
    id: string,
    subjectIds: string[],
  ): Promise<SubjectDto[]> {
    const schoolClass = await this.find(scope, id);
    const found = await this.repository.countSubjectsInSchool(
      schoolClass.schoolId,
      subjectIds,
    );
    if (found !== subjectIds.length)
      throw invalid(
        'Every subject must be an active subject of the same school',
      );
    const before = await this.subjects(scope, id);
    await this.repository.replaceSubjects(id, schoolClass.schoolId, subjectIds);
    const after = await this.subjects(scope, id);
    this.audit.stage({
      action: 'class.subjects_set',
      entityType: 'SchoolClass',
      entityId: id,
      schoolId: schoolClass.schoolId,
      before: before.map((s) => s.code),
      after: after.map((s) => s.code),
    });
    return after;
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
