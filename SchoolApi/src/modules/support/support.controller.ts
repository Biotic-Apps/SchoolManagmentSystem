import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../core/common/decorators/current-user.decorator';
import { forbidden } from '../../core/common/errors/errors';
import type { PageResult } from '../../core/common/pagination/page-result';
import { ApiData, ApiPage } from '../../core/common/swagger/api-data.decorator';
import type { AuthUser } from '../../core/common/types/auth-user';
import { RequirePermission } from '../../core/rbac/require-permission.decorator';
import { RoleKey } from '../../core/rbac/role-key.enum';
import { AuthThrottle } from '../../core/throttling/auth-throttle.decorator';
import {
  FailedNotificationDto,
  FailedNotificationQueryDto,
  ResendResultDto,
} from './dto/failed-notification.dto';
import { JobRunDto, JobRunQueryDto } from './dto/job-run.dto';
import { SystemHealthDto } from './dto/system-health.dto';
import { TestMessageDto, TestMessageResultDto } from './dto/test-message.dto';
import { FailedNotificationsService } from './failed-notifications.service';
import { SupportHealthService } from './support-health.service';
import { SupportJobsService } from './support-jobs.service';
import { TestMessageService } from './test-message.service';

/** Operations data is system-wide: only an active SUPER_ADMIN role may see it. */
function assertSupportAccess(user: AuthUser): void {
  if (user.activeRole !== (RoleKey.SUPER_ADMIN as string)) {
    throw forbidden('Settings › Support is for super admins');
  }
}

/** Settings › Support (phase5-contract §C). */
@ApiTags('support')
@ApiBearerAuth()
@RequirePermission('settings.edit')
@Controller('support')
export class SupportController {
  constructor(
    private readonly notifications: FailedNotificationsService,
    private readonly jobs: SupportJobsService,
    private readonly healthService: SupportHealthService,
    private readonly testMessages: TestMessageService,
  ) {}

  @Get('notifications/failed')
  @ApiPage(FailedNotificationDto)
  failed(
    @CurrentUser() user: AuthUser,
    @Query() query: FailedNotificationQueryDto,
  ): Promise<PageResult<FailedNotificationDto>> {
    assertSupportAccess(user);
    return this.notifications.list(query);
  }

  @Post('notifications/failed/resend-all')
  @HttpCode(200)
  @ApiData(ResendResultDto)
  resendAll(
    @CurrentUser() user: AuthUser,
    @Body() body: FailedNotificationQueryDto,
  ): Promise<ResendResultDto> {
    assertSupportAccess(user);
    return this.notifications.resendAll(body);
  }

  @Post('notifications/failed/:id/resend')
  @HttpCode(200)
  @ApiData(FailedNotificationDto)
  resend(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<FailedNotificationDto> {
    assertSupportAccess(user);
    return this.notifications.resend(id);
  }

  @Get('jobs')
  @ApiPage(JobRunDto)
  jobRuns(
    @CurrentUser() user: AuthUser,
    @Query() query: JobRunQueryDto,
  ): Promise<PageResult<JobRunDto>> {
    assertSupportAccess(user);
    return this.jobs.list(query);
  }

  @Post('jobs/:id/retry')
  @HttpCode(200)
  @ApiData(JobRunDto)
  retry(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<JobRunDto> {
    assertSupportAccess(user);
    return this.jobs.retry(user, id);
  }

  @Get('health')
  @ApiData(SystemHealthDto)
  health(@CurrentUser() user: AuthUser): Promise<SystemHealthDto> {
    assertSupportAccess(user);
    return this.healthService.health();
  }

  /** Phase 6 §A: one synchronous message through the configured provider. */
  @AuthThrottle()
  @Post('test-message')
  @HttpCode(200)
  @ApiData(TestMessageResultDto)
  testMessage(
    @CurrentUser() user: AuthUser,
    @Body() body: TestMessageDto,
  ): Promise<TestMessageResultDto> {
    assertSupportAccess(user);
    return this.testMessages.send(user, body);
  }
}
