import { Injectable } from '@nestjs/common';
import { AuditService } from '../../audit/audit.service';
import { PrismaService } from '../../prisma/prisma.service';
import {
  isCritical,
  NOTIFICATION_CATEGORIES,
} from '../notification-categories';
import type {
  NotificationPreferenceDto,
  PreferenceInputDto,
} from './notification-preference.dto';

/** In-app is always on; push can be muted except for critical categories. */
@Injectable()
export class NotificationPreferencesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async list(userId: string): Promise<NotificationPreferenceDto[]> {
    const rows = await this.prisma.notificationPreference.findMany({
      where: { userId },
    });
    const push = new Map(rows.map((row) => [row.category, row.push]));
    return NOTIFICATION_CATEGORIES.map((category) => ({
      category,
      inApp: true,
      push: isCritical(category) || (push.get(category) ?? true),
      critical: isCritical(category),
    }));
  }

  async update(
    userId: string,
    preferences: PreferenceInputDto[],
  ): Promise<NotificationPreferenceDto[]> {
    const changes = preferences.filter((p) => !isCritical(p.category));
    await this.prisma.$transaction(
      changes.map((p) =>
        this.prisma.notificationPreference.upsert({
          where: { userId_category: { userId, category: p.category } },
          create: { userId, category: p.category, push: p.push },
          update: { push: p.push },
        }),
      ),
    );
    this.audit.stage({
      action: 'notification.preferences_update',
      entityType: 'User',
      entityId: userId,
      after: changes,
    });
    return this.list(userId);
  }
}
