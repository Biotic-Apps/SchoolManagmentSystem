import { Injectable } from '@nestjs/common';
import { AuditService } from '../../core/audit/audit.service';
import { invalid } from '../../core/common/errors/errors';
import { toJson } from '../../core/common/prisma-json';
import type { AuthUser } from '../../core/common/types/auth-user';
import type { Scope } from '../../core/rbac/scope/scope';
import type { NotificationSettings } from '../../core/school-settings/notification-settings';
import { SchoolSettingsReader } from '../../core/school-settings/school-settings.reader';
import type { UpdateNotificationSettingsDto } from './dto/notification-settings.dto';
import {
  categoriesProblem,
  mergeNotificationSettings,
  withAllCategories,
} from './notification-settings.rules';
import { editableSchool, readableSchool } from './settings-access';
import { SettingsRepository } from './settings.repository';

@Injectable()
export class NotificationSettingsService {
  constructor(
    private readonly repository: SettingsRepository,
    private readonly reader: SchoolSettingsReader,
    private readonly audit: AuditService,
  ) {}

  async get(scope: Scope, schoolId: string): Promise<NotificationSettings> {
    await readableSchool(this.repository, scope, schoolId);
    return withAllCategories(await this.reader.notifications(schoolId));
  }

  async update(
    user: AuthUser,
    scope: Scope,
    schoolId: string,
    dto: UpdateNotificationSettingsDto,
  ): Promise<NotificationSettings> {
    await editableSchool(this.repository, user, scope, schoolId);
    const problem = categoriesProblem(dto.categories ?? []);
    if (problem) throw invalid(problem);
    await this.reader.invalidate(schoolId);
    const before = await this.reader.notifications(schoolId);
    const next = mergeNotificationSettings(before, dto);
    await this.repository.upsert(schoolId, {
      notifications: toJson(next),
      updatedById: user.id,
    });
    await this.reader.invalidate(schoolId);
    this.audit.stage({
      action: 'settings.notifications.update',
      entityType: 'SchoolSetting',
      entityId: schoolId,
      schoolId,
      before,
      after: next,
    });
    return withAllCategories(next);
  }
}
