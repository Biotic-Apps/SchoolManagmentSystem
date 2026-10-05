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
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { PageResult } from '../common/pagination/page-result';
import { toPageResult } from '../common/pagination/paginate';
import { ApiData, ApiPage } from '../common/swagger/api-data.decorator';
import type { AuthUser } from '../common/types/auth-user';
import { RequirePermission } from '../rbac/require-permission.decorator';
import { CurrentScope } from '../rbac/scope/current-scope.decorator';
import type { Scope } from '../rbac/scope/scope';
import { toApprovalDto } from './approval.mapper';
import { ApprovalService } from './approval.service';
import { ApprovalsRepository } from './approvals.repository';
import { ApprovalQueryDto } from './dto/approval-query.dto';
import { ApprovalRequestDto } from './dto/approval-request.dto';
import { DecideApprovalDto } from './dto/decide-approval.dto';

@ApiTags('approvals')
@ApiBearerAuth()
@Controller('approvals')
export class ApprovalsController {
  constructor(
    private readonly approvals: ApprovalService,
    private readonly repository: ApprovalsRepository,
  ) {}

  @Get()
  @RequirePermission('approvals.view')
  @ApiPage(ApprovalRequestDto)
  async list(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Query() query: ApprovalQueryDto,
  ): Promise<PageResult<ApprovalRequestDto>> {
    const filter = {
      userId: user.id,
      activeRole: user.activeRole,
      status: query.status,
      type: query.type,
    };
    const { rows, total } = await this.repository.list(scope, filter, query);
    return toPageResult(
      rows.map((row) => toApprovalDto(row, false)),
      total,
      query,
    );
  }

  @Get(':id')
  @RequirePermission('approvals.view')
  @ApiData(ApprovalRequestDto)
  async get(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ApprovalRequestDto> {
    return toApprovalDto(await this.approvals.get(user, scope, id), true);
  }

  @Post(':id/decide')
  @HttpCode(200)
  @RequirePermission('approvals.approve')
  @ApiData(ApprovalRequestDto)
  async decide(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: DecideApprovalDto,
  ): Promise<ApprovalRequestDto> {
    return toApprovalDto(
      await this.approvals.decide(user, scope, id, body),
      true,
    );
  }
}
