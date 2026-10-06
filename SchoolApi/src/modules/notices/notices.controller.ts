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
import { OkDto } from '../../core/common/dto/ok.dto';
import type { PageResult } from '../../core/common/pagination/page-result';
import { ApiData, ApiPage } from '../../core/common/swagger/api-data.decorator';
import type { AuthUser } from '../../core/common/types/auth-user';
import { RequirePermission } from '../../core/rbac/require-permission.decorator';
import { CurrentScope } from '../../core/rbac/scope/current-scope.decorator';
import type { Scope } from '../../core/rbac/scope/scope';
import {
  CreateNoticeDto,
  NoticeQueryDto,
  UpdateNoticeDto,
} from './dto/notice-input.dto';
import { NoticeDto, NoticeReadsDto } from './dto/notice.dto';
import { NoticeWorkflowService } from './notice-workflow.service';
import { NoticesService } from './notices.service';

@ApiTags('notices')
@ApiBearerAuth()
@Controller('notices')
export class NoticesController {
  constructor(
    private readonly notices: NoticesService,
    private readonly workflow: NoticeWorkflowService,
  ) {}

  @Get()
  @RequirePermission('notices.view')
  @ApiPage(NoticeDto)
  list(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Query() query: NoticeQueryDto,
  ): Promise<PageResult<NoticeDto>> {
    return this.notices.list(user, scope, query);
  }

  @Post()
  @RequirePermission('notices.add')
  @ApiData(NoticeDto)
  create(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Body() body: CreateNoticeDto,
  ): Promise<NoticeDto> {
    return this.notices.create(user, scope, body);
  }

  @Patch(':id')
  @RequirePermission('notices.add', 'notices.edit')
  @ApiData(NoticeDto)
  update(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdateNoticeDto,
  ): Promise<NoticeDto> {
    return this.notices.update(user, scope, id, body);
  }

  @Post(':id/publish')
  @HttpCode(200)
  @RequirePermission('notices.publish', 'notices.add')
  @ApiData(NoticeDto)
  publish(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<NoticeDto> {
    return this.workflow.publish(user, scope, id);
  }

  @Post(':id/read')
  @HttpCode(200)
  @RequirePermission('notices.view')
  @ApiData(OkDto)
  read(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<OkDto> {
    return this.notices.markRead(user, id);
  }

  @Get(':id/reads')
  @RequirePermission('notices.view')
  @ApiData(NoticeReadsDto)
  reads(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<NoticeReadsDto> {
    return this.notices.reads(user, scope, id);
  }
}
