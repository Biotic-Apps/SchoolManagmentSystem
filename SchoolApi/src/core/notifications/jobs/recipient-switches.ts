import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import type { NotificationSettings } from '../../school-settings/notification-settings';
import { SchoolSettingsReader } from '../../school-settings/school-settings.reader';
import { effectiveSwitches, type ChannelSwitches } from '../channel-switches';

/**
 * School channel switches per recipient. A recipient's schools are the
 * schools of their active role assignments; GLOBAL assignments (or none)
 * mean every active school. Settings come from the cached reader.
 */
@Injectable()
export class RecipientSwitches {
  constructor(
    private readonly prisma: PrismaService,
    private readonly settings: SchoolSettingsReader,
  ) {}

  async forUsers(
    userIds: string[],
    category: string,
  ): Promise<Map<string, ChannelSwitches>> {
    const schoolsByUser = await this.recipientSchools(userIds);
    const cache = new Map<string, Promise<NotificationSettings>>();
    const load = (schoolId: string) => {
      if (!cache.has(schoolId)) {
        cache.set(schoolId, this.settings.notifications(schoolId));
      }
      return cache.get(schoolId)!;
    };
    let allSchools: Promise<string[]> | undefined;
    const result = new Map<string, ChannelSwitches>();
    for (const userId of userIds) {
      let schoolIds = schoolsByUser.get(userId) ?? null;
      if (schoolIds === null || schoolIds.length === 0) {
        allSchools ??= this.activeSchoolIds();
        schoolIds = await allSchools;
      }
      const list = await Promise.all(schoolIds.map(load));
      result.set(userId, effectiveSwitches(list, category));
    }
    return result;
  }

  /** userId → school ids, or null for users with a GLOBAL assignment. */
  private async recipientSchools(
    userIds: string[],
  ): Promise<Map<string, string[] | null>> {
    const now = new Date();
    const rows = await this.prisma.roleAssignment.findMany({
      where: {
        userId: { in: userIds },
        revokedAt: null,
        validFrom: { lte: now },
        OR: [{ validUntil: null }, { validUntil: { gt: now } }],
      },
      select: { userId: true, scopeType: true, schoolId: true },
    });
    const map = new Map<string, string[] | null>();
    for (const row of rows) {
      const current = map.get(row.userId);
      if (current === null) continue;
      if (row.scopeType === 'GLOBAL') {
        map.set(row.userId, null);
        continue;
      }
      const list = current ?? [];
      if (row.schoolId && !list.includes(row.schoolId)) list.push(row.schoolId);
      map.set(row.userId, list);
    }
    return map;
  }

  private async activeSchoolIds(): Promise<string[]> {
    const rows = await this.prisma.school.findMany({
      where: { status: 'ACTIVE' },
      select: { id: true },
    });
    return rows.map((row) => row.id);
  }
}
