import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { fullName } from '../../students/student.mapper';
import type { DuesGuardianDto, DuesStudentDto } from './dto/dues.dto';

export interface DuesInfo {
  student(studentId: string, sectionId: string | null): DuesStudentDto;
  guardian(studentId: string): DuesGuardianDto | null;
}

/** Names, class/section and guardian contact for one page of dues. */
@Injectable()
export class DuesDetails {
  constructor(private readonly prisma: PrismaService) {}

  async load(
    rows: { studentId: string; sectionId: string | null }[],
  ): Promise<DuesInfo> {
    const studentIds = rows.map((r) => r.studentId);
    const sectionIds = rows
      .map((r) => r.sectionId)
      .filter((id): id is string => !!id);
    const [students, sections, links] = await Promise.all([
      this.prisma.student.findMany({
        where: { id: { in: studentIds } },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          admissionNo: true,
        },
      }),
      this.prisma.section.findMany({
        where: { id: { in: sectionIds } },
        select: {
          id: true,
          name: true,
          schoolClass: { select: { name: true } },
        },
      }),
      this.prisma.studentGuardian.findMany({
        where: { studentId: { in: studentIds }, status: 'VERIFIED' },
        select: {
          studentId: true,
          relation: true,
          isPrimary: true,
          guardian: { select: { name: true, phone: true } },
        },
        orderBy: [{ isPrimary: 'desc' }, { createdAt: 'asc' }],
      }),
    ]);
    const studentById = new Map(students.map((s) => [s.id, s]));
    const sectionById = new Map(sections.map((s) => [s.id, s]));
    const guardianOf = new Map<string, DuesGuardianDto>();
    for (const link of links) {
      if (guardianOf.has(link.studentId)) continue;
      guardianOf.set(link.studentId, {
        name: link.guardian.name,
        phone: link.guardian.phone,
        relation: link.relation,
      });
    }
    return {
      student: (studentId, sectionId) => {
        const student = studentById.get(studentId);
        const section = sectionId ? sectionById.get(sectionId) : undefined;
        return {
          id: studentId,
          name: student ? fullName(student) : '',
          admissionNo: student?.admissionNo ?? '',
          className: section?.schoolClass.name ?? null,
          sectionName: section?.name ?? null,
        };
      },
      guardian: (studentId) => guardianOf.get(studentId) ?? null,
    };
  }
}
