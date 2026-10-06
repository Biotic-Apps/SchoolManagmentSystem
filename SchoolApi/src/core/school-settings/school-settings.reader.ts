import { Injectable } from '@nestjs/common';
import { CacheStore } from '../cache/cache-store';
import { PrismaService } from '../prisma/prisma.service';
import {
  withNotificationDefaults,
  type NotificationSettings,
} from './notification-settings';
import {
  strictestPolicies,
  withPolicyDefaults,
  type SchoolPolicies,
} from './school-policies';

const KEY = 'school-settings:';
const TTL_SECONDS = 60;

interface CachedSettings {
  policies: SchoolPolicies;
  notifications: NotificationSettings;
}

/**
 * Internal, cached read of school settings (no permission check). Writers
 * call `invalidate` after a change. Missing rows mean defaults.
 */
@Injectable()
export class SchoolSettingsReader {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: CacheStore,
  ) {}

  async policies(schoolId: string): Promise<SchoolPolicies> {
    return (await this.load(schoolId)).policies;
  }

  async notifications(schoolId: string): Promise<NotificationSettings> {
    return (await this.load(schoolId)).notifications;
  }

  /**
   * Strictest auth policies over the given schools; `null` = every school
   * (users with a GLOBAL assignment, e.g. SUPER_ADMIN).
   */
  async authPolicies(schoolIds: string[] | null) {
    const ids =
      schoolIds ??
      (
        await this.prisma.school.findMany({
          where: { status: 'ACTIVE' },
          select: { id: true },
        })
      ).map((s) => s.id);
    const list = await Promise.all(ids.map((id) => this.policies(id)));
    return strictestPolicies(list);
  }

  invalidate(schoolId: string): Promise<void> {
    return this.cache.del(KEY + schoolId);
  }

  private load(schoolId: string): Promise<CachedSettings> {
    return this.cache.getOrLoad(KEY + schoolId, TTL_SECONDS, async () => {
      const row = await this.prisma.schoolSetting.findUnique({
        where: { schoolId },
        select: { policies: true, notifications: true },
      });
      return {
        policies: withPolicyDefaults(row?.policies),
        notifications: withNotificationDefaults(row?.notifications),
      };
    });
  }
}
