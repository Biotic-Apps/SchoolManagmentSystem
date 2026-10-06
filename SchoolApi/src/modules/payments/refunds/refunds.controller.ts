import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../../core/common/decorators/current-user.decorator';
import type { PageResult } from '../../../core/common/pagination/page-result';
import {
  ApiData,
  ApiPage,
} from '../../../core/common/swagger/api-data.decorator';
import type { AuthUser } from '../../../core/common/types/auth-user';
import { RequirePermission } from '../../../core/rbac/require-permission.decorator';
import { CurrentScope } from '../../../core/rbac/scope/current-scope.decorator';
import type { Scope } from '../../../core/rbac/scope/scope';
import { CreateRefundDto, RefundDto, RefundQueryDto } from './dto/refund.dto';
import { RefundsService } from './refunds.service';

@ApiTags('payments')
@ApiBearerAuth()
@Controller('refunds')
export class RefundsController {
  constructor(private readonly refunds: RefundsService) {}

  @Post()
  @RequirePermission('fees.add')
  @ApiData(RefundDto)
  create(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Body() body: CreateRefundDto,
  ): Promise<RefundDto> {
    return this.refunds.create(user, scope, body);
  }

  @Get()
  @RequirePermission('fees.view')
  @ApiPage(RefundDto)
  list(
    @CurrentScope() scope: Scope,
    @Query() query: RefundQueryDto,
  ): Promise<PageResult<RefundDto>> {
    return this.refunds.list(scope, query);
  }
}
