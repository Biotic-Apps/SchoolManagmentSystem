import { Injectable } from '@nestjs/common';
import { AuditService } from '../../../core/audit/audit.service';
import { ErrorCode } from '../../../core/common/errors/error-code.enum';
import {
  domainError,
  invalid,
  notFound,
} from '../../../core/common/errors/errors';
import { PrismaService } from '../../../core/prisma/prisma.service';
import type { Scope } from '../../../core/rbac/scope/scope';
import { normalizeGroup } from '../curriculum/curriculum';
import type { ClassSubjectDto } from '../dto/class-subject.dto';
import type {
  ReorderClassesDto,
  SetClassSubjectsDto,
} from '../dto/set-class-subjects.dto';
import { SchoolDataAccess } from '../school-data-access';
import {
  ClassCurriculumRepository,
  type CurriculumItem,
} from './class-curriculum.repository';

/** Class curriculum (subjects, periods/week, group, order) and class order (contract §5.2). */
@Injectable()
export class ClassCurriculumService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly repository: ClassCurriculumRepository,
    private readonly access: SchoolDataAccess,
    private readonly audit: AuditService,
  ) {}

  async set(
    scope: Scope,
    classId: string,
    dto: SetClassSubjectsDto,
  ): Promise<ClassSubjectDto[]> {
    const schoolClass = await this.prisma.schoolClass.findUnique({
      where: { id: classId },
    });
    if (!schoolClass) throw notFound('Class');
    await this.access.assertManage(scope, schoolClass.schoolId);
    const before = await this.repository.list(classId);
    const items = this.items(dto, before);

    const ids = items.map((i) => i.subjectId);
    const found = await this.repository.subjectsOf(schoolClass.schoolId, ids);
    if (found.length !== ids.length)
      throw invalid(
        'Every subject must be an active subject of the same school',
      );
    const removed = before
      .map((s) => s.subjectId)
      .filter((id) => !ids.includes(id));
    const used = await this.repository.usage(classId, removed);
    if (used.size > 0)
      throw domainError(
        ErrorCode.SUBJECT_IN_USE,
        'Some removed subjects are still taught in this class',
        [...used.values()],
      );

    await this.repository.replace(schoolClass.schoolId, classId, items);
    const after = await this.repository.list(classId);
    this.audit.stage({
      action: 'class.subjects.update',
      entityType: 'SchoolClass',
      entityId: classId,
      schoolId: schoolClass.schoolId,
      before: before.map(summary),
      after: after.map(summary),
    });
    return after;
  }

  async reorder(scope: Scope, dto: ReorderClassesDto): Promise<void> {
    const classes = await this.prisma.schoolClass.findMany({
      where: { id: { in: dto.classIds } },
      select: { id: true, schoolId: true, name: true, levelOrder: true },
    });
    const schoolIds = new Set(classes.map((c) => c.schoolId));
    if (classes.length !== dto.classIds.length || schoolIds.size !== 1)
      throw invalid('classIds must be classes of one school');
    const schoolId = classes[0].schoolId;
    await this.access.assertManage(scope, schoolId);
    const active = await this.prisma.schoolClass.count({
      where: { schoolId, status: 'ACTIVE', id: { notIn: dto.classIds } },
    });
    if (active > 0) throw invalid('classIds must list every active class');

    await this.prisma.$transaction(
      dto.classIds.map((id, i) =>
        this.prisma.schoolClass.update({
          where: { id },
          data: { levelOrder: i + 1 },
        }),
      ),
    );
    const name = new Map(classes.map((c) => [c.id, c.name]));
    this.audit.stage({
      action: 'class.order.update',
      entityType: 'School',
      entityId: schoolId,
      schoolId,
      before: [...classes]
        .sort((a, b) => a.levelOrder - b.levelOrder)
        .map((c) => c.name),
      after: dto.classIds.map((id) => name.get(id)),
    });
  }

  /** New `items` body, or legacy `subjectIds` keeping settings of kept links. */
  private items(
    dto: SetClassSubjectsDto,
    before: ClassSubjectDto[],
  ): CurriculumItem[] {
    if (dto.items) {
      const ids = dto.items.map((i) => i.subjectId);
      if (new Set(ids).size !== ids.length)
        throw invalid('A subject is listed twice');
      return dto.items.map((i) => ({
        subjectId: i.subjectId,
        periodsPerWeek: i.periodsPerWeek ?? null,
        isOptional: i.isOptional ?? false,
        group: normalizeGroup(i.group),
      }));
    }
    if (!dto.subjectIds) throw invalid('items is required');
    const kept = new Map(before.map((s) => [s.subjectId, s]));
    return dto.subjectIds.map((subjectId) => {
      const old = kept.get(subjectId);
      return {
        subjectId,
        periodsPerWeek: old?.periodsPerWeek ?? null,
        isOptional: old?.isOptional ?? false,
        group: old?.group ?? null,
      };
    });
  }
}

const summary = (s: ClassSubjectDto) => ({
  subject: s.name,
  periodsPerWeek: s.periodsPerWeek,
  group: s.group,
  isOptional: s.isOptional,
});
