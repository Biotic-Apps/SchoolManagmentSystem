import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../core/prisma/prisma.service';
import type { StudentPlacement } from '../school-day/student-placement.service';
import {
  mergeStaffOptions,
  type RawStaffOption,
  type StaffOption,
} from './message-target';

/** Staff a parent may write to about a child: teachers of the section and the principal. */
@Injectable()
export class MessageRecipientsService {
  constructor(private readonly prisma: PrismaService) {}

  async staffFor(placement: StudentPlacement): Promise<StaffOption[]> {
    const [section, assignments, branch] = await Promise.all([
      this.prisma.section.findUnique({
        where: { id: placement.sectionId },
        select: { classTeacher: { select: { userId: true, name: true } } },
      }),
      this.prisma.staffAssignment.findMany({
        where: {
          sectionId: placement.sectionId,
          kind: { in: ['CLASS_TEACHER', 'SUBJECT_TEACHER'] },
          endedAt: null,
          staff: { status: 'ACTIVE' },
        },
        select: {
          kind: true,
          staff: { select: { userId: true, name: true } },
          subject: { select: { name: true } },
        },
        orderBy: { createdAt: 'asc' },
      }),
      this.prisma.branch.findUnique({
        where: { id: placement.branchId },
        select: { principal: { select: { id: true, name: true } } },
      }),
    ]);
    const raw: RawStaffOption[] = [];
    if (section?.classTeacher)
      raw.push({ ...section.classTeacher, role: 'CLASS_TEACHER' });
    for (const a of assignments.filter((x) => x.kind === 'CLASS_TEACHER'))
      raw.push({ ...a.staff, role: 'CLASS_TEACHER' });
    for (const a of assignments.filter((x) => x.kind === 'SUBJECT_TEACHER'))
      raw.push({
        ...a.staff,
        role: 'SUBJECT_TEACHER',
        subjectName: a.subject?.name,
      });
    if (branch?.principal)
      raw.push({
        userId: branch.principal.id,
        name: branch.principal.name,
        role: 'PRINCIPAL',
      });
    return mergeStaffOptions(raw);
  }
}
