import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { RoleKey } from '../../../core/rbac/role-key.enum';
import { activeAssignmentWhere } from '../../users/active-assignment-where';
import type { SlipGuardianState } from './login-slip-plan';

export interface SlipGuardian extends SlipGuardianState {
  name: string;
  email: string | null;
  phone: string | null;
  userId: string | null;
}

export interface SlipPlanRow {
  studentId: string;
  /** Primary verified guardian, else the first verified one. */
  guardian: SlipGuardian | null;
}

/** For each child, the guardian whose slip prints and the state of their sign-in. */
@Injectable()
export class LoginSlipPlanReader {
  constructor(private readonly prisma: PrismaService) {}

  async read(studentIds: string[]): Promise<SlipPlanRow[]> {
    const links = await this.prisma.studentGuardian.findMany({
      where: {
        studentId: { in: studentIds },
        status: 'VERIFIED',
        guardian: { status: 'ACTIVE' },
      },
      orderBy: [{ isPrimary: 'desc' }, { createdAt: 'asc' }],
      select: {
        studentId: true,
        guardian: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            userId: true,
            user: {
              select: {
                email: true,
                phone: true,
                status: true,
                lastLoginAt: true,
                _count: {
                  select: {
                    roleAssignments: {
                      where: {
                        AND: [
                          activeAssignmentWhere(),
                          { role: { key: { not: RoleKey.PARENT } } },
                        ],
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });
    const first = new Map<string, (typeof links)[number]['guardian']>();
    for (const link of links)
      if (!first.has(link.studentId)) first.set(link.studentId, link.guardian);
    return studentIds.map((studentId) => {
      const g = first.get(studentId);
      if (!g) return { studentId, guardian: null };
      return {
        studentId,
        guardian: {
          guardianId: g.id,
          name: g.name,
          userId: g.userId,
          email: g.user?.email ?? g.email,
          phone: g.user?.phone ?? g.phone,
          user: g.user
            ? {
                status: g.user.status,
                lastLoginAt: g.user.lastLoginAt,
                staffRoles: g.user._count.roleAssignments,
              }
            : null,
        },
      };
    });
  }
}
