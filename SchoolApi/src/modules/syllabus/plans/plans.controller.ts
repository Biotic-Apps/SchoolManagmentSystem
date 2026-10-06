import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../../core/common/decorators/current-user.decorator';
import { ApiData } from '../../../core/common/swagger/api-data.decorator';
import type { AuthUser } from '../../../core/common/types/auth-user';
import { RequirePermission } from '../../../core/rbac/require-permission.decorator';
import { CurrentScope } from '../../../core/rbac/scope/current-scope.decorator';
import type { Scope } from '../../../core/rbac/scope/scope';
import { CommentDto } from '../dto/book-list.dto';
import {
  PlanDraftDto,
  PlanQueryDto,
  SyllabusPlanDto,
} from '../dto/syllabus.dto';
import { PlansService } from './plans.service';

@ApiTags('syllabus')
@ApiBearerAuth()
@Controller('syllabus-plans')
export class PlansController {
  constructor(private readonly plans: PlansService) {}

  @Get()
  @RequirePermission('syllabus.view')
  @ApiData(SyllabusPlanDto, { isArray: true })
  list(
    @CurrentScope() scope: Scope,
    @Query() query: PlanQueryDto,
  ): Promise<SyllabusPlanDto[]> {
    return this.plans.list(scope, query);
  }

  @Put('draft')
  @RequirePermission('syllabus.edit')
  @ApiData(SyllabusPlanDto)
  draft(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Body() body: PlanDraftDto,
  ): Promise<SyllabusPlanDto> {
    return this.plans.saveDraft(user, scope, body);
  }

  @Post(':id/submit')
  @HttpCode(200)
  @RequirePermission('syllabus.edit')
  @ApiData(SyllabusPlanDto)
  submit(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<SyllabusPlanDto> {
    return this.plans.submit(user, scope, id);
  }

  @Post(':id/approve')
  @HttpCode(200)
  @RequirePermission('syllabus.approve')
  @ApiData(SyllabusPlanDto)
  approve(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: CommentDto,
  ): Promise<SyllabusPlanDto> {
    return this.plans.decide(user, scope, id, 'APPROVED', body.comment);
  }

  @Post(':id/return')
  @HttpCode(200)
  @RequirePermission('syllabus.approve')
  @ApiData(SyllabusPlanDto)
  returnPlan(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: CommentDto,
  ): Promise<SyllabusPlanDto> {
    return this.plans.decide(user, scope, id, 'RETURNED', body.comment);
  }
}
