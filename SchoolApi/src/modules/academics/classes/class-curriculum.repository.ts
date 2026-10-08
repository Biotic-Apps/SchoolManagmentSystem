import { Injectable } from '@nestjs/common';
import type { Prisma } from '../../../generated/prisma/client';
import { PrismaService } from '../../../core/prisma/prisma.service';
import type { ClassSubjectDto } from '../dto/class-subject.dto';

export interface CurriculumItem {
  subjectId: string;
  periodsPerWeek: number | null;
  isOptional: boolean;
  group: string | null;
}

/** class_subjects of one class (the curriculum). */
@Injectable()
export class ClassCurriculumRepository {
  constructor(private readonly prisma: PrismaService) {}

  async list(classId: string): Promise<ClassSubjectDto[]> {
    const rows = await this.prisma.classSubject.findMany({
      where: { classId, status: 'ACTIVE' },
      include: { subject: { select: { code: true, name: true } } },
      orderBy: [{ sortOrder: 'asc' }, { subject: { name: 'asc' } }],
    });
    return rows.map((r) => ({
      id: r.subjectId,
      subjectId: r.subjectId,
      code: r.subject.code,
      name: r.subject.name,
      periodsPerWeek: r.periodsPerWeek,
      isOptional: r.isOptional,
      group: r.group,
      sortOrder: r.sortOrder,
    }));
  }

  /** Active subjects of the school among `ids` (with names). */
  subjectsOf(schoolId: string, ids: string[]) {
    return this.prisma.subject.findMany({
      where: { schoolId, id: { in: ids }, status: 'ACTIVE' },
      select: { id: true, name: true },
    });
  }

  /** Per subject: active subject-teacher assignments and lessons in this class's sections. */
  async usage(classId: string, subjectIds: string[]) {
    if (subjectIds.length === 0) return new Map<string, string>();
    const [assignments, slots, subjects] = await Promise.all([
      this.prisma.staffAssignment.groupBy({
        by: ['subjectId'],
        where: {
          subjectId: { in: subjectIds },
          endedAt: null,
          section: { classId },
        },
        _count: { _all: true },
      }),
      this.prisma.timetableSlot.groupBy({
        by: ['subjectId'],
        where: {
          subjectId: { in: subjectIds },
          timetable: { section: { classId } },
        },
        _count: { _all: true },
      }),
      this.prisma.subject.findMany({
        where: { id: { in: subjectIds } },
        select: { id: true, name: true },
      }),
    ]);
    const used = new Map<string, string>();
    for (const subject of subjects) {
      const a =
        assignments.find((r) => r.subjectId === subject.id)?._count._all ?? 0;
      const s = slots.find((r) => r.subjectId === subject.id)?._count._all ?? 0;
      if (a + s === 0) continue;
      const parts = [
        a > 0 && `${a} teacher assignment${a === 1 ? '' : 's'}`,
        s > 0 && `${s} lesson${s === 1 ? '' : 's'}`,
      ].filter(Boolean);
      used.set(subject.id, `${subject.name}: ${parts.join(', ')}`);
    }
    return used;
  }

  async replace(
    schoolId: string,
    classId: string,
    items: CurriculumItem[],
  ): Promise<void> {
    const ids = items.map((i) => i.subjectId);
    await this.prisma.$transaction(async (tx) => {
      await tx.classSubject.deleteMany({
        where: { classId, subjectId: { notIn: ids } },
      });
      for (const [sortOrder, item] of items.entries()) {
        const data: Omit<Prisma.ClassSubjectUncheckedCreateInput, 'schoolId'> =
          {
            classId,
            subjectId: item.subjectId,
            periodsPerWeek: item.periodsPerWeek,
            isOptional: item.isOptional,
            group: item.group,
            sortOrder,
            status: 'ACTIVE',
          };
        await tx.classSubject.upsert({
          where: {
            classId_subjectId: { classId, subjectId: item.subjectId },
          },
          create: { ...data, schoolId },
          update: data,
        });
      }
    });
  }

  /** Appends subjects to the end of each class (POST /subjects with classIds). */
  async link(
    tx: Prisma.TransactionClient,
    schoolId: string,
    classIds: string[],
    subjectId: string,
    periodsPerWeek: number | null,
  ): Promise<void> {
    for (const classId of classIds) {
      const last = await tx.classSubject.aggregate({
        where: { classId },
        _max: { sortOrder: true },
      });
      await tx.classSubject.create({
        data: {
          schoolId,
          classId,
          subjectId,
          periodsPerWeek,
          sortOrder: (last._max.sortOrder ?? -1) + 1,
        },
      });
    }
  }
}
