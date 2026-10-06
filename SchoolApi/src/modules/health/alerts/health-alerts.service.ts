import { Injectable } from '@nestjs/common';
import { notFound } from '../../../core/common/errors/errors';
import { PrismaService } from '../../../core/prisma/prisma.service';
import type { Scope } from '../../../core/rbac/scope/scope';
import type { HealthAlertDto } from '../dto/health-incident.dto';
import { toHealthProfile } from '../profile/health-profile.mapper';

/** Roster badges: active students of a section with allergies/instructions. */
@Injectable()
export class HealthAlertsService {
  constructor(private readonly prisma: PrismaService) {}

  async forSection(scope: Scope, sectionId: string): Promise<HealthAlertDto[]> {
    const section = await this.prisma.section.findUnique({
      where: { id: sectionId },
      select: { id: true, branchId: true, schoolId: true },
    });
    if (!section) throw notFound('Section');
    scope.assertReadSection(section, 'Section');
    const enrollments = await this.prisma.enrollment.findMany({
      where: {
        sectionId,
        status: 'ACTIVE',
        student: { healthProfile: { isNot: null } },
      },
      select: {
        rollNo: true,
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            healthProfile: true,
          },
        },
      },
      orderBy: [{ rollNo: 'asc' }, { student: { firstName: 'asc' } }],
    });
    return enrollments
      .map(({ rollNo, student }) => {
        const profile = toHealthProfile(student.healthProfile);
        return {
          studentId: student.id,
          name: `${student.firstName} ${student.lastName}`,
          rollNo,
          allergies: profile.allergies,
          instructions: profile.instructions,
        };
      })
      .filter((a) => a.allergies.length > 0 || !!a.instructions?.trim());
  }
}
