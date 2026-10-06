import { Injectable } from '@nestjs/common';
import type { Section } from '../../generated/prisma/client';
import { notFound } from '../../core/common/errors/errors';
import { PrismaService } from '../../core/prisma/prisma.service';
import type { Scope } from '../../core/rbac/scope/scope';

/** Section-level reads for staff scopes and for parents (their children's sections). */
@Injectable()
export class SectionAccessService {
  constructor(private readonly prisma: PrismaService) {}

  async read(scope: Scope, sectionId: string): Promise<Section> {
    const section = await this.prisma.section.findUnique({
      where: { id: sectionId },
    });
    if (!section) throw notFound('Section');
    if (scope.guardian) {
      const childHere = await this.prisma.enrollment.count({
        where: {
          sectionId,
          status: 'ACTIVE',
          studentId: { in: [...scope.studentIds] },
        },
      });
      if (childHere === 0) throw notFound('Section');
      return section;
    }
    scope.assertReadSection(section, 'Section');
    return section;
  }

  /** The child's current section (parents) or 404. */
  async ofChild(scope: Scope, studentId: string): Promise<Section> {
    if (!scope.global && !scope.canAccessStudent(studentId))
      throw notFound('Student');
    const enrollment = await this.prisma.enrollment.findFirst({
      where: { studentId, status: 'ACTIVE' },
      include: { section: true },
    });
    if (!enrollment) throw notFound('Student enrollment');
    return enrollment.section;
  }
}
