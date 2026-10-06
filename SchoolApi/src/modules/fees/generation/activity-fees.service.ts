import { Injectable } from '@nestjs/common';
import { schoolDateTime } from '../../../core/common/school-time';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { addMonths } from '../../finance-core/period';

export const ACTIVITY_REF = 'Activity';

export interface ActivityCharge {
  activityId: string;
  title: string;
  feeMinor: bigint;
}

/**
 * Phase 3 activity/trip fees billed with the monthly invoice: activities of
 * the branch with a fee that start in the period (school time), for students
 * who take part or whose guardian GRANTED consent; never billed twice.
 */
@Injectable()
export class ActivityFeesService {
  constructor(private readonly prisma: PrismaService) {}

  async chargesByStudent(
    branchId: string,
    period: string,
    studentIds: string[],
  ): Promise<Map<string, ActivityCharge[]>> {
    const result = new Map<string, ActivityCharge[]>();
    if (studentIds.length === 0) return result;
    const activities = await this.prisma.activity.findMany({
      where: {
        branchId,
        feeMinor: { gt: 0n },
        status: { in: ['ANNOUNCED', 'ONGOING', 'COMPLETED'] },
        startAt: {
          gte: schoolDateTime(`${period}-01`, '00:00'),
          lt: schoolDateTime(`${addMonths(period, 1)}-01`, '00:00'),
        },
      },
      select: {
        id: true,
        title: true,
        feeMinor: true,
        participants: {
          where: { studentId: { in: studentIds } },
          select: { studentId: true },
        },
        consents: {
          where: { studentId: { in: studentIds }, status: 'GRANTED' },
          select: { studentId: true },
        },
      },
      orderBy: { startAt: 'asc' },
    });
    if (activities.length === 0) return result;
    const billed = await this.prisma.invoiceLine.findMany({
      where: {
        refType: ACTIVITY_REF,
        refId: { in: activities.map((a) => a.id) },
        invoice: {
          studentId: { in: studentIds },
          status: { not: 'CANCELLED' },
        },
      },
      select: { refId: true, invoice: { select: { studentId: true } } },
    });
    const done = new Set(
      billed.map((b) => `${b.invoice.studentId}:${b.refId}`),
    );
    for (const activity of activities) {
      const students = new Set([
        ...activity.participants.map((p) => p.studentId),
        ...activity.consents.map((c) => c.studentId),
      ]);
      for (const studentId of students) {
        if (done.has(`${studentId}:${activity.id}`)) continue;
        result.set(studentId, [
          ...(result.get(studentId) ?? []),
          {
            activityId: activity.id,
            title: activity.title,
            feeMinor: activity.feeMinor ?? 0n,
          },
        ]);
      }
    }
    return result;
  }
}
