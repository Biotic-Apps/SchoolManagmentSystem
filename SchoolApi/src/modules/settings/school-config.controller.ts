import { Body, Controller, Get, Patch, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../core/common/decorators/current-user.decorator';
import { ApiData } from '../../core/common/swagger/api-data.decorator';
import type { AuthUser } from '../../core/common/types/auth-user';
import { RequirePermission } from '../../core/rbac/require-permission.decorator';
import { CurrentScope } from '../../core/rbac/scope/current-scope.decorator';
import type { Scope } from '../../core/rbac/scope/scope';
import type { NotificationSettings } from '../../core/school-settings/notification-settings';
import type { SchoolPolicies } from '../../core/school-settings/school-policies';
import {
  NotificationSettingsDto,
  UpdateNotificationSettingsDto,
} from './dto/notification-settings.dto';
import { PoliciesDto, UpdatePoliciesDto } from './dto/policies.dto';
import { SchoolQueryDto } from './dto/school-query.dto';
import { NotificationSettingsService } from './notification-settings.service';
import { PoliciesService } from './policies.service';

/** Notification switches and school policies, both by `?schoolId=`. */
@ApiTags('settings')
@ApiBearerAuth()
@Controller('settings')
export class SchoolConfigController {
  constructor(
    private readonly notifications: NotificationSettingsService,
    private readonly policies: PoliciesService,
  ) {}

  @Get('notifications')
  @RequirePermission('settings.view')
  @ApiData(NotificationSettingsDto)
  getNotifications(
    @CurrentScope() scope: Scope,
    @Query() query: SchoolQueryDto,
  ): Promise<NotificationSettings> {
    return this.notifications.get(scope, query.schoolId);
  }

  @Patch('notifications')
  @RequirePermission('settings.edit')
  @ApiData(NotificationSettingsDto)
  updateNotifications(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Query() query: SchoolQueryDto,
    @Body() body: UpdateNotificationSettingsDto,
  ): Promise<NotificationSettings> {
    return this.notifications.update(user, scope, query.schoolId, body);
  }

  @Get('policies')
  @RequirePermission('settings.view')
  @ApiData(PoliciesDto)
  getPolicies(
    @CurrentScope() scope: Scope,
    @Query() query: SchoolQueryDto,
  ): Promise<SchoolPolicies> {
    return this.policies.get(scope, query.schoolId);
  }

  @Patch('policies')
  @RequirePermission('settings.edit')
  @ApiData(PoliciesDto)
  updatePolicies(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Query() query: SchoolQueryDto,
    @Body() body: UpdatePoliciesDto,
  ): Promise<SchoolPolicies> {
    return this.policies.update(user, scope, query.schoolId, body);
  }
}
