import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { fullName } from '../../students/student.mapper';

export interface RosterStudent {
  studentId: string;
  name: string;
  rollNo: number | null;
  sectionId: string;
}

const byRoll = (a: RosterStudent, b: RosterStudent) =>
  (a.rollNo ?? Number.MAX_SAFE_INTEGER) -
    (b.rollNo ?? Number.MAX_SAFE_INTEGER) || a.name.localeCompare(b.name);

/** Active students of sections (the mark sheet / result roster). */
@Injectable()
export class RosterService {
  constructor(private readonly prisma: PrismaService) {}

  async of(sectionId: string): Promise<RosterStudent[]> {
    return (await this.many([sectionId])).get(sectionId) ?? [];
  }

  async many(sectionIds: string[]): Promise<Map<string, RosterStudent[]>> {
    const map = new Map<string, RosterStudent[]>();
    if (sectionIds.length === 0) return map;
    const rows = await this.prisma.enrollment.findMany({
      where: { sectionId: { in: [...new Set(sectionIds)] }, status: 'ACTIVE' },
      select: {
        studentId: true,
        sectionId: true,
        rollNo: true,
        student: { select: { firstName: true, lastName: true } },
      },
    });
    for (const row of rows) {
      const list = map.get(row.sectionId) ?? [];
      list.push({
        studentId: row.studentId,
        sectionId: row.sectionId,
        rollNo: row.rollNo,
        name: fullName(row.student),
      });
      map.set(row.sectionId, list);
    }
    for (const list of map.values()) list.sort(byRoll);
    return map;
  }

  /** Names and current roll numbers for any students (also not active). */
  async people(
    studentIds: string[],
  ): Promise<Map<string, { name: string; rollNo: number | null }>> {
    const rows = await this.prisma.student.findMany({
      where: { id: { in: [...new Set(studentIds)] } },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        enrollments: {
          orderBy: { startDate: 'desc' },
          take: 1,
          select: { rollNo: true },
        },
      },
    });
    return new Map(
      rows.map((r) => [
        r.id,
        { name: fullName(r), rollNo: r.enrollments[0]?.rollNo ?? null },
      ]),
    );
  }
}
