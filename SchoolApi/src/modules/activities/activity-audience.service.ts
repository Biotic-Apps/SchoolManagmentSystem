import { Injectable } from '@nestjs/common';
import type { Prisma } from '../../generated/prisma/client';
import { invalid } from '../../core/common/errors/errors';
import { PrismaService } from '../../core/prisma/prisma.service';
import type { BranchRef } from '../../core/rbac/scope/scope';
import {
  isEmptyAudience,
  normalizeAudience,
  readAudience,
  type ActivityAudience,
} from './activity-audience';
import type { ActivityAudienceInputDto } from './dto/activity-input.dto';

type Db = Prisma.TransactionClient;

/** Validates an activity audience and expands it to students and guardians. */
@Injectable()
export class ActivityAudienceService {
  constructor(private readonly prisma: PrismaService) {}

  async validate(
    branch: BranchRef,
    input: ActivityAudienceInputDto,
  ): Promise<ActivityAudience> {
    const audience = normalizeAudience(input);
    if (isEmptyAudience(audience))
      throw invalid('Audience needs sectionIds, classIds or wholeBranch');
    if (audience.sectionIds.length > 0) {
      const found = await this.prisma.section.count({
        where: { id: { in: audience.sectionIds }, branchId: branch.id },
      });
      if (found !== audience.sectionIds.length)
        throw invalid('Some sections do not belong to the branch');
    }
    if (audience.classIds.length > 0) {
      const found = await this.prisma.schoolClass.count({
        where: { id: { in: audience.classIds }, schoolId: branch.schoolId },
      });
      if (found !== audience.classIds.length)
        throw invalid('Some classes do not belong to the school');
    }
    return audience;
  }

  /** ACTIVE students of the branch that the audience reaches. */
  async studentIds(
    activity: { branchId: string; audience: Prisma.JsonValue },
    db: Db = this.prisma,
  ): Promise<string[]> {
    const audience = readAudience(activity.audience);
    const rows = await db.enrollment.findMany({
      where: {
        branchId: activity.branchId,
        status: 'ACTIVE',
        student: { status: 'ACTIVE' },
        ...(audience.wholeBranch
          ? {}
          : {
              OR: [
                { sectionId: { in: audience.sectionIds } },
                { section: { classId: { in: audience.classIds } } },
              ],
            }),
      },
      select: { studentId: true },
    });
    return rows.map((r) => r.studentId);
  }

  /** Primary verified guardian per student (else the oldest verified one). */
  async primaryGuardians(
    studentIds: string[],
    db: Db = this.prisma,
  ): Promise<Map<string, string>> {
    const links = await db.studentGuardian.findMany({
      where: { studentId: { in: studentIds }, status: 'VERIFIED' },
      select: { studentId: true, guardianId: true },
      orderBy: [{ isPrimary: 'desc' }, { createdAt: 'asc' }],
    });
    const map = new Map<string, string>();
    for (const link of links) {
      if (!map.has(link.studentId)) map.set(link.studentId, link.guardianId);
    }
    return map;
  }
}
