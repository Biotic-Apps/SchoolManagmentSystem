import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { workingSlotWhere } from '../curriculum/working-slots';

export interface SetupScope {
  schoolId: string;
  branchId: string;
  sessionId: string | null;
  classIds?: string[];
  /** Section-limited callers (teachers) only see these sections. */
  sectionIds?: string[];
}

/** Bulk reads behind GET /classes/overview and /classes/:id/setup. */
@Injectable()
export class ClassSetupRepository {
  constructor(private readonly prisma: PrismaService) {}

  async load(input: SetupScope) {
    const classes = await this.prisma.schoolClass.findMany({
      where: {
        schoolId: input.schoolId,
        ...(input.classIds
          ? { id: { in: input.classIds } }
          : { status: 'ACTIVE' }),
      },
      include: {
        subjects: {
          where: { status: 'ACTIVE', subject: { status: 'ACTIVE' } },
          include: {
            subject: { select: { id: true, code: true, name: true } },
          },
          orderBy: [{ sortOrder: 'asc' }, { subject: { name: 'asc' } }],
        },
      },
      orderBy: { levelOrder: 'asc' },
    });
    const sections = input.sessionId
      ? await this.prisma.section.findMany({
          where: {
            branchId: input.branchId,
            sessionId: input.sessionId,
            status: 'ACTIVE',
            classId: { in: classes.map((c) => c.id) },
            ...(input.sectionIds && { id: { in: input.sectionIds } }),
          },
          include: {
            room: { select: { id: true, name: true } },
            classTeacher: { select: { id: true, name: true } },
            timetables: {
              where: { sessionId: input.sessionId },
              select: { status: true },
            },
            _count: {
              select: { enrollments: { where: { status: 'ACTIVE' } } },
            },
          },
          orderBy: { name: 'asc' },
        })
      : [];
    const sectionIds = sections.map((s) => s.id);
    const [teachers, placed] = await Promise.all([
      this.subjectTeachers(sectionIds),
      this.placed(sectionIds),
    ]);
    return { classes, sections, teachers, placed };
  }

  private subjectTeachers(sectionIds: string[]) {
    return this.prisma.staffAssignment.findMany({
      where: {
        sectionId: { in: sectionIds },
        kind: 'SUBJECT_TEACHER',
        isSubstitute: false,
        endedAt: null,
      },
      select: {
        id: true,
        sectionId: true,
        subjectId: true,
        staff: { select: { id: true, name: true } },
      },
    });
  }

  /** `sectionId:subjectId` → lessons in the working timetable. */
  private async placed(sectionIds: string[]): Promise<Map<string, number>> {
    if (sectionIds.length === 0) return new Map();
    const timetables = await this.prisma.timetable.findMany({
      where: { sectionId: { in: sectionIds } },
      select: { id: true, sectionId: true },
    });
    const sectionOf = new Map(timetables.map((t) => [t.id, t.sectionId]));
    const rows = await this.prisma.timetableSlot.groupBy({
      by: ['timetableId', 'subjectId'],
      where: {
        timetableId: { in: [...sectionOf.keys()] },
        AND: [workingSlotWhere()],
      },
      _count: { _all: true },
    });
    return new Map(
      rows.map((r) => [
        `${sectionOf.get(r.timetableId)}:${r.subjectId}`,
        r._count._all,
      ]),
    );
  }
}

export type SetupData = Awaited<ReturnType<ClassSetupRepository['load']>>;
