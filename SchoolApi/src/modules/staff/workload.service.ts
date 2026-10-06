import { Injectable } from '@nestjs/common';
import { notFound } from '../../core/common/errors/errors';
import { PrismaService } from '../../core/prisma/prisma.service';
import type { Scope } from '../../core/rbac/scope/scope';
import type { SectionStaffDto, WorkloadDto } from './dto/staff.dto';
import { StaffAccessService } from './staff-access.service';

@Injectable()
export class WorkloadService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly access: StaffAccessService,
  ) {}

  async workload(
    scope: Scope,
    staffId: string,
    sessionId?: string,
  ): Promise<WorkloadDto> {
    const staff = await this.access.read(scope, staffId);
    const session =
      sessionId ??
      (
        await this.prisma.academicSession.findFirst({
          where: { branchId: staff.branchId, status: 'ACTIVE' },
        })
      )?.id;
    const [periodsPerWeek, assignments] = await Promise.all([
      this.prisma.timetableSlot.count({
        where: { staffId, published: true, timetable: { sessionId: session } },
      }),
      this.prisma.staffAssignment.findMany({
        where: { staffId, sessionId: session, endedAt: null },
        select: { sectionId: true, subjectId: true },
      }),
    ]);
    const distinct = (values: (string | null)[]) =>
      new Set(values.filter(Boolean)).size;
    return {
      periodsPerWeek,
      sections: distinct(assignments.map((a) => a.sectionId)),
      subjects: distinct(assignments.map((a) => a.subjectId)),
    };
  }

  async sectionStaff(
    scope: Scope,
    sectionId: string,
  ): Promise<SectionStaffDto> {
    const section = await this.prisma.section.findUnique({
      where: { id: sectionId },
    });
    if (!section) throw notFound('Section');
    scope.assertReadSection(section, 'Section');
    const rows = await this.prisma.staffAssignment.findMany({
      where: { sectionId, endedAt: null },
      include: {
        staff: { select: { id: true, name: true } },
        subject: { select: { id: true, name: true } },
        responsibleStaff: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'asc' },
    });
    return {
      classTeacher: rows.find((r) => r.kind === 'CLASS_TEACHER')?.staff ?? null,
      subjectTeachers: rows
        .filter((r) => r.kind === 'SUBJECT_TEACHER' && r.subject)
        .map((r) => ({
          staff: r.staff,
          subject: r.subject!,
          isSubstitute: r.isSubstitute,
        })),
      helpers: rows
        .filter((r) => r.kind === 'HELPER')
        .map((r) => ({ staff: r.staff, responsibleStaff: r.responsibleStaff })),
    };
  }
}
