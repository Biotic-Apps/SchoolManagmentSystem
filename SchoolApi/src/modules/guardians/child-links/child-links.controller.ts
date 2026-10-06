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
import { ApprovalService } from '../../../core/approvals/approval.service';
import { CurrentUser } from '../../../core/common/decorators/current-user.decorator';
import { conflict, notFound } from '../../../core/common/errors/errors';
import type { PageResult } from '../../../core/common/pagination/page-result';
import { toPageResult } from '../../../core/common/pagination/paginate';
import {
  ApiData,
  ApiPage,
} from '../../../core/common/swagger/api-data.decorator';
import type { AuthUser } from '../../../core/common/types/auth-user';
import { RequirePermission } from '../../../core/rbac/require-permission.decorator';
import { CurrentScope } from '../../../core/rbac/scope/current-scope.decorator';
import type { Scope } from '../../../core/rbac/scope/scope';
import { AuthThrottle } from '../../../core/throttling/auth-throttle.decorator';
import {
  ChildLinkQueryDto,
  ChildLinkRequestDto,
  ChildLinkStartedDto,
  DecideChildLinkDto,
  RequestChildLinkDto,
  VerifyChildLinkOtpDto,
} from './child-link.dto';
import { ChildLinkRequestService } from './child-link-request.service';
import { toChildLinkDto } from './child-link.mapper';
import { ChildLinksRepository } from './child-links.repository';

@ApiTags('guardians')
@ApiBearerAuth()
@Controller('child-links')
export class ChildLinksController {
  constructor(
    private readonly requests: ChildLinkRequestService,
    private readonly repository: ChildLinksRepository,
    private readonly approvals: ApprovalService,
  ) {}

  @Post('request')
  @HttpCode(200)
  @AuthThrottle()
  @RequirePermission('guardians.add')
  @ApiData(ChildLinkStartedDto)
  start(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Body() body: RequestChildLinkDto,
  ): Promise<ChildLinkStartedDto> {
    return this.requests.start(user, scope, body);
  }

  @Post(':id/otp')
  @HttpCode(200)
  @AuthThrottle()
  @RequirePermission('guardians.add')
  @ApiData(ChildLinkRequestDto)
  verify(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: VerifyChildLinkOtpDto,
  ): Promise<ChildLinkRequestDto> {
    return this.requests.verifyOtp(user, id, body.code);
  }

  @Get()
  @RequirePermission('guardians.view')
  @ApiPage(ChildLinkRequestDto)
  async list(
    @CurrentScope() scope: Scope,
    @Query() query: ChildLinkQueryDto,
  ): Promise<PageResult<ChildLinkRequestDto>> {
    const { rows, total } = await this.repository.list(scope, query);
    return toPageResult(rows.map(toChildLinkDto), total, query);
  }

  @Post(':id/approve')
  @HttpCode(200)
  @RequirePermission('guardians.edit')
  @ApiData(ChildLinkRequestDto)
  approve(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: DecideChildLinkDto,
  ): Promise<ChildLinkRequestDto> {
    return this.decide(user, scope, id, 'APPROVED', body.comment);
  }

  @Post(':id/reject')
  @HttpCode(200)
  @RequirePermission('guardians.edit')
  @ApiData(ChildLinkRequestDto)
  reject(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: DecideChildLinkDto,
  ): Promise<ChildLinkRequestDto> {
    return this.decide(
      user,
      scope,
      id,
      'REJECTED',
      body.reason ?? body.comment,
    );
  }

  /** Goes through the approval engine; ChildLinkHandler applies the result. */
  private async decide(
    user: AuthUser,
    scope: Scope,
    id: string,
    decision: 'APPROVED' | 'REJECTED',
    comment?: string,
  ): Promise<ChildLinkRequestDto> {
    const request = await this.repository.findById(id);
    if (!request?.approvalRequestId) throw notFound('Link request');
    if (request.status !== 'REQUESTED')
      throw conflict('Request is not awaiting a decision');
    await this.approvals.decide(user, scope, request.approvalRequestId, {
      decision,
      comment,
    });
    return toChildLinkDto((await this.repository.findById(id))!);
  }
}
