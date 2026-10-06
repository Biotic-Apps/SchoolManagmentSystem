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
import { AdjustmentsService } from './adjustments.service';
import {
  AdjustmentDto,
  AdjustmentQueryDto,
  CreateAdjustmentDto,
} from './dto/adjustment.dto';

@ApiTags('payroll')
@ApiBearerAuth()
@Controller('payroll/adjustments')
export class AdjustmentsController {
  constructor(private readonly adjustments: AdjustmentsService) {}

  @Get()
  @RequirePermission('payroll.view')
  @ApiPage(AdjustmentDto)
  list(
    @CurrentScope() scope: Scope,
    @Query() query: AdjustmentQueryDto,
  ): Promise<PageResult<AdjustmentDto>> {
    return this.adjustments.list(scope, query);
  }

  @Post()
  @RequirePermission('payroll.edit')
  @ApiData(AdjustmentDto)
  create(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Body() body: CreateAdjustmentDto,
  ): Promise<AdjustmentDto> {
    return this.adjustments.create(user, scope, body);
  }
}
