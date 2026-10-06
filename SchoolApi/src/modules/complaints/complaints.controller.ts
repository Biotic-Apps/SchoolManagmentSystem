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
import type { PageResult } from '../../core/common/pagination/page-result';
import { ApiData, ApiPage } from '../../core/common/swagger/api-data.decorator';
import type { AuthUser } from '../../core/common/types/auth-user';
import { RequirePermission } from '../../core/rbac/require-permission.decorator';
import { CurrentScope } from '../../core/rbac/scope/current-scope.decorator';
import type { Scope } from '../../core/rbac/scope/scope';
import { ComplaintActionsService } from './complaint-actions.service';
import { ComplaintsService } from './complaints.service';
import {
  AssignComplaintDto,
  ComplaintQueryDto,
  ComplaintReasonDto,
  ComplaintUpdateInputDto,
  CreateComplaintDto,
} from './dto/complaint-input.dto';
import { ComplaintDto } from './dto/complaint.dto';

@ApiTags('complaints')
@ApiBearerAuth()
@Controller('complaints')
export class ComplaintsController {
  constructor(
    private readonly complaints: ComplaintsService,
    private readonly actions: ComplaintActionsService,
  ) {}

  @Post()
  @ApiData(ComplaintDto)
  create(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Body() body: CreateComplaintDto,
  ): Promise<ComplaintDto> {
    return this.complaints.create(user, scope, body);
  }

  @Get()
  @RequirePermission('complaints.view')
  @ApiPage(ComplaintDto)
  list(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Query() query: ComplaintQueryDto,
  ): Promise<PageResult<ComplaintDto>> {
    return this.complaints.list(user, scope, query);
  }

  @Get(':id')
  @RequirePermission('complaints.view')
  @ApiData(ComplaintDto)
  get(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ComplaintDto> {
    return this.complaints.get(user, scope, id);
  }

  @Post(':id/assign')
  @HttpCode(200)
  @RequirePermission('complaints.edit')
  @ApiData(ComplaintDto)
  async assign(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: AssignComplaintDto,
  ): Promise<ComplaintDto> {
    await this.actions.assign(user, scope, id, body);
    return this.complaints.afterAction(user, id);
  }

  @Post(':id/updates')
  @HttpCode(200)
  @ApiData(ComplaintDto)
  async addUpdate(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: ComplaintUpdateInputDto,
  ): Promise<ComplaintDto> {
    await this.actions.addUpdate(user, scope, id, body);
    return this.complaints.afterAction(user, id);
  }

  @Post(':id/escalate')
  @HttpCode(200)
  @ApiData(ComplaintDto)
  async escalate(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: ComplaintReasonDto,
  ): Promise<ComplaintDto> {
    await this.actions.escalate(user, scope, id, body);
    return this.complaints.afterAction(user, id);
  }

  @Post(':id/close')
  @HttpCode(200)
  @ApiData(ComplaintDto)
  async close(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: ComplaintReasonDto,
  ): Promise<ComplaintDto> {
    await this.actions.close(user, scope, id, body);
    return this.complaints.afterAction(user, id);
  }

  @Post(':id/reopen')
  @HttpCode(200)
  @ApiData(ComplaintDto)
  async reopen(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: ComplaintReasonDto,
  ): Promise<ComplaintDto> {
    await this.actions.reopen(user, scope, id, body);
    return this.complaints.afterAction(user, id);
  }
}
