import { Injectable } from '@nestjs/common';
import type { Subject } from '../../../generated/prisma/client';
import { AuditService } from '../../../core/audit/audit.service';
import { invalid, notFound } from '../../../core/common/errors/errors';
import { PrismaService } from '../../../core/prisma/prisma.service';
import type { PageResult } from '../../../core/common/pagination/page-result';
import { toPageResult } from '../../../core/common/pagination/paginate';
import type { AuthUser } from '../../../core/common/types/auth-user';
import type { Scope } from '../../../core/rbac/scope/scope';
import { toSubjectDto } from '../academics.mapper';
import type { CreateSubjectDto } from '../dto/create-subject.dto';
import type { SchoolQueryDto } from '../dto/school-query.dto';
import type { SubjectDto } from '../dto/subject.dto';
import type { UpdateSubjectDto } from '../dto/update-subject.dto';
import { ClassCurriculumRepository } from '../classes/class-curriculum.repository';
import { uniqueCode } from '../curriculum/subject-codes';
import { SchoolDataAccess } from '../school-data-access';
import { onDuplicate } from '../unique-conflict';
import { SubjectsRepository } from './subjects.repository';

@Injectable()
export class SubjectsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly repository: SubjectsRepository,
    private readonly curriculum: ClassCurriculumRepository,
    private readonly access: SchoolDataAccess,
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
    await this.access.assertManage(scope, dto.schoolId);
    const classIds = dto.classIds ?? [];
    if (classIds.length > 0) {
      const found = await this.prisma.schoolClass.count({
        where: { id: { in: classIds }, schoolId: dto.schoolId },
      });
      if (found !== classIds.length)
        throw invalid('classIds must be classes of the same school');
    }
    const name = dto.name.trim();
    const code = dto.code ?? (await this.autoCode(dto.schoolId, name));
    const row = await this.prisma
      .$transaction(async (tx) => {
        const subject = await this.repository.create(
          { schoolId: dto.schoolId, code, name, createdById: user.id },
          tx,
        );
        await this.curriculum.link(
          tx,
          dto.schoolId,
          classIds,
          subject.id,
          dto.periodsPerWeek ?? null,
        );
        return subject;
      })
      .catch(onDuplicate(`Subject code ${code} already exists`));
    return this.audited('subject.create', undefined, row, classIds);
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

  private async autoCode(schoolId: string, name: string): Promise<string> {
    const taken = await this.prisma.subject.findMany({
      where: { schoolId },
      select: { code: true },
    });
    return uniqueCode(name, new Set(taken.map((s) => s.code)));
  }

  private audited(
    action: string,
    before: Subject | undefined,
    after: Subject,
    classIds: string[] = [],
  ): SubjectDto {
    const dto = toSubjectDto(after);
    this.audit.stage({
      action,
      entityType: 'Subject',
      entityId: after.id,
      schoolId: after.schoolId,
      before: before && toSubjectDto(before),
      after: classIds.length > 0 ? { ...dto, classIds } : dto,
    });
    return dto;
  }
}
