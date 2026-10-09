import { Injectable } from '@nestjs/common';
import { AuditService } from '../../../../core/audit/audit.service';
import {
  conflict,
  forbiddenScope,
  notFound,
} from '../../../../core/common/errors/errors';
import type { AuthUser } from '../../../../core/common/types/auth-user';
import { QUEUES } from '../../../../core/jobs/queues';
import { PrismaService } from '../../../../core/prisma/prisma.service';
import type { Scope } from '../../../../core/rbac/scope/scope';
import { AsyncTaskService } from '../../../tasks/async-task.service';
import type { IdCardPrintDto, IdCardPrintJobDto } from './id-card-bulk.dto';
import {
  ID_CARD_SHEET_JOB,
  MAX_SHEET_CARDS,
  type IdCardSheetInput,
} from './id-card-bulk-job';

interface SheetSection {
  id: string;
  name: string;
  schoolId: string;
  branchId: string;
  schoolClass: { name: string; levelOrder: number };
}

const SECTION_SELECT = {
  id: true,
  name: true,
  schoolId: true,
  branchId: true,
  schoolClass: { select: { name: true, levelOrder: true } },
} as const;

const slug = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

/** POST /students/id-cards/print: ID cards of a section/class on A4 sheets. */
@Injectable()
export class IdCardBulkService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tasks: AsyncTaskService,
    private readonly audit: AuditService,
  ) {}

  async request(
    user: AuthUser,
    scope: Scope,
    dto: IdCardPrintDto,
  ): Promise<IdCardPrintJobDto> {
    if (scope.guardian) throw notFound('Section');
    const sections = await this.sections(scope, dto);
    const studentIds = await this.students(sections);
    const first = sections[0];
    const label =
      sections.length === 1
        ? `${first.schoolClass.name} ${first.name}`
        : dto.classId
          ? first.schoolClass.name
          : 'branch';
    const input: IdCardSheetInput = {
      schoolId: first.schoolId,
      requestedById: user.id,
      studentIds,
      baseName: `id-cards-${slug(label)}`,
    };
    const jobId = await this.tasks.enqueue(user, {
      queue: QUEUES.DOCUMENTS,
      name: ID_CARD_SHEET_JOB,
      data: input,
      params: { ...dto, count: studentIds.length },
      schoolId: first.schoolId,
      branchId: first.branchId,
      format: 'PDF',
    });
    this.audit.stage({
      action: 'student.id_card_sheet',
      entityType: 'Section',
      entityId: dto.sectionId ?? first.id,
      schoolId: first.schoolId,
      branchId: first.branchId,
      after: { ...dto, count: studentIds.length, jobId },
    });
    return { jobId, count: studentIds.length };
  }

  /** Current students in section order, then roll number. */
  private async students(sections: SheetSection[]): Promise<string[]> {
    const rows = await this.prisma.enrollment.findMany({
      where: { sectionId: { in: sections.map((s) => s.id) }, status: 'ACTIVE' },
      select: {
        studentId: true,
        sectionId: true,
        rollNo: true,
        student: { select: { firstName: true } },
      },
    });
    if (rows.length === 0)
      throw conflict('No current students in these sections');
    if (rows.length > MAX_SHEET_CARDS)
      throw conflict(
        `Print at most ${MAX_SHEET_CARDS} cards at once; choose a class or section`,
      );
    const order = new Map(sections.map((s, i) => [s.id, i]));
    rows.sort(
      (a, b) =>
        (order.get(a.sectionId) ?? 0) - (order.get(b.sectionId) ?? 0) ||
        (a.rollNo ?? 1e9) - (b.rollNo ?? 1e9) ||
        a.student.firstName.localeCompare(b.student.firstName),
    );
    return rows.map((r) => r.studentId);
  }

  /** The named section, or current sections of a branch (optionally one class). */
  private async sections(
    scope: Scope,
    dto: IdCardPrintDto,
  ): Promise<SheetSection[]> {
    if (dto.sectionId) {
      const section = await this.prisma.section.findUnique({
        where: { id: dto.sectionId },
        select: SECTION_SELECT,
      });
      if (!section) throw notFound('Section');
      if (!scope.canReadSection(section)) throw forbiddenScope();
      return [section];
    }
    const rows = await this.prisma.section.findMany({
      where: {
        branchId: dto.branchId,
        classId: dto.classId,
        status: 'ACTIVE',
        session: { status: 'ACTIVE' },
      },
      select: SECTION_SELECT,
      orderBy: [{ schoolClass: { levelOrder: 'asc' } }, { name: 'asc' }],
    });
    const readable = rows.filter((s) => scope.canReadSection(s));
    if (readable.length === 0)
      throw rows.length === 0 ? notFound('Section') : forbiddenScope();
    return readable;
  }
}
