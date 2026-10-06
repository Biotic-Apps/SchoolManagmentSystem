import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../core/common/decorators/current-user.decorator';
import { ApiData } from '../../core/common/swagger/api-data.decorator';
import type { AuthUser } from '../../core/common/types/auth-user';
import { RequirePermission } from '../../core/rbac/require-permission.decorator';
import { CurrentScope } from '../../core/rbac/scope/current-scope.decorator';
import type { Scope } from '../../core/rbac/scope/scope';
import { ChildTodayService } from './daily/child-today.service';
import { PendingService } from './daily/pending.service';
import { TeacherTodayService } from './daily/teacher-today.service';
import { DashboardService } from './dashboard.service';
import {
  ChildTodayDto,
  ChildTodayQueryDto,
  DashboardPendingDto,
  PendingQueryDto,
  TeacherTodayDto,
} from './dto/daily-dashboard.dto';
import { DashboardQueryDto } from './dto/dashboard-query.dto';
import { DashboardSummaryDto } from './dto/dashboard-summary.dto';

@ApiTags('dashboard')
@ApiBearerAuth()
@Controller('dashboard')
export class DashboardController {
  constructor(
    private readonly dashboard: DashboardService,
    private readonly pendingList: PendingService,
    private readonly teacher: TeacherTodayService,
    private readonly child: ChildTodayService,
  ) {}

  @Get('summary')
  @RequirePermission('dashboard.view')
  @ApiData(DashboardSummaryDto)
  summary(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Query() query: DashboardQueryDto,
  ): Promise<DashboardSummaryDto> {
    return this.dashboard.summary(user, scope, query);
  }

  @Get('pending')
  @RequirePermission('dashboard.view')
  @ApiData(DashboardPendingDto)
  pending(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Query() query: PendingQueryDto,
  ): Promise<DashboardPendingDto> {
    return this.pendingList.pending(user, scope, query);
  }

  @Get('teacher-today')
  @RequirePermission('dashboard.view')
  @ApiData(TeacherTodayDto)
  teacherToday(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
  ): Promise<TeacherTodayDto> {
    return this.teacher.today(user, scope);
  }

  @Get('child-today')
  @RequirePermission('dashboard.view')
  @ApiData(ChildTodayDto)
  childToday(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Query() query: ChildTodayQueryDto,
  ): Promise<ChildTodayDto> {
    return this.child.today(user, scope, query.studentId);
  }
}
