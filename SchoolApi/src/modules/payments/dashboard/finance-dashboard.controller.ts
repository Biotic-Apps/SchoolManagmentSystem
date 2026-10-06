import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ApiData } from '../../../core/common/swagger/api-data.decorator';
import { RequirePermission } from '../../../core/rbac/require-permission.decorator';
import { CurrentScope } from '../../../core/rbac/scope/current-scope.decorator';
import type { Scope } from '../../../core/rbac/scope/scope';
import {
  FinanceDashboardDto,
  FinanceDashboardQueryDto,
} from './dto/finance-dashboard.dto';
import { FinanceDashboardService } from './finance-dashboard.service';

@ApiTags('dashboard')
@ApiBearerAuth()
@Controller('dashboard/finance')
export class FinanceDashboardController {
  constructor(private readonly dashboard: FinanceDashboardService) {}

  @Get()
  @RequirePermission('fees.view')
  @ApiData(FinanceDashboardDto)
  get(
    @CurrentScope() scope: Scope,
    @Query() query: FinanceDashboardQueryDto,
  ): Promise<FinanceDashboardDto> {
    return this.dashboard.get(scope, query);
  }
}
