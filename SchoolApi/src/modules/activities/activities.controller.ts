import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../core/common/decorators/current-user.decorator';
import type { PageResult } from '../../core/common/pagination/page-result';
import { ApiData, ApiPage } from '../../core/common/swagger/api-data.decorator';
import type { AuthUser } from '../../core/common/types/auth-user';
import { RequirePermission } from '../../core/rbac/require-permission.decorator';
import { CurrentScope } from '../../core/rbac/scope/current-scope.decorator';
import type { Scope } from '../../core/rbac/scope/scope';
import { ActivitiesService } from './activities.service';
import { ActivityLifecycleService } from './activity-lifecycle.service';
import {
  ActivityCommentDto,
  ActivityQueryDto,
  ActivityStatusDto,
  CreateActivityDto,
  MineQueryDto,
  UpdateActivityDto,
} from './dto/activity-input.dto';
import { ActivityDto, MyActivitiesDto } from './dto/activity.dto';
import { MyActivitiesService } from './my-activities.service';

@ApiTags('activities')
@ApiBearerAuth()
@Controller('activities')
export class ActivitiesController {
  constructor(
    private readonly activities: ActivitiesService,
    private readonly lifecycle: ActivityLifecycleService,
    private readonly mine: MyActivitiesService,
  ) {}

  @Get()
  @RequirePermission('activities.view')
  @ApiPage(ActivityDto)
  list(
    @CurrentScope() scope: Scope,
    @Query() query: ActivityQueryDto,
  ): Promise<PageResult<ActivityDto>> {
    return this.activities.list(scope, query);
  }

  @Post()
  @RequirePermission('activities.add')
  @ApiData(ActivityDto)
  create(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Body() body: CreateActivityDto,
  ): Promise<ActivityDto> {
    return this.activities.create(user, scope, body);
  }

  @Get('mine')
  @RequirePermission('activities.view')
  @ApiData(MyActivitiesDto)
  forChild(
    @CurrentScope() scope: Scope,
    @Query() query: MineQueryDto,
  ): Promise<MyActivitiesDto> {
    return this.mine.forChild(scope, query.studentId);
  }

  @Get(':id')
  @RequirePermission('activities.view')
  @ApiData(ActivityDto)
  get(
    @CurrentScope() scope: Scope,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ActivityDto> {
    return this.activities.get(scope, id);
  }

  @Patch(':id')
  @RequirePermission('activities.edit')
  @ApiData(ActivityDto)
  update(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdateActivityDto,
  ): Promise<ActivityDto> {
    return this.activities.update(user, scope, id, body);
  }

  @Post(':id/approve')
  @HttpCode(200)
  @RequirePermission('activities.approve')
  @ApiData(ActivityDto)
  approve(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: ActivityCommentDto,
  ): Promise<ActivityDto> {
    return this.lifecycle.decide(user, scope, id, 'APPROVED', body.comment);
  }

  @Post(':id/reject')
  @HttpCode(200)
  @RequirePermission('activities.approve')
  @ApiData(ActivityDto)
  reject(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: ActivityCommentDto,
  ): Promise<ActivityDto> {
    return this.lifecycle.decide(user, scope, id, 'REJECTED', body.comment);
  }

  @Post(':id/status')
  @HttpCode(200)
  @RequirePermission('activities.edit')
  @ApiData(ActivityDto)
  setStatus(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: ActivityStatusDto,
  ): Promise<ActivityDto> {
    return this.lifecycle.setStatus(user, scope, id, body);
  }
}
