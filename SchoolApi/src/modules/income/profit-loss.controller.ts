import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RequirePermission } from '../../core/rbac/require-permission.decorator';
import { CurrentScope } from '../../core/rbac/scope/current-scope.decorator';
import type { Scope } from '../../core/rbac/scope/scope';
import { ProfitLossQueryDto } from './dto/profit-loss.dto';
import { ProfitLossService, type ProfitLossDto } from './profit-loss.service';

@ApiTags('income')
@ApiBearerAuth()
@Controller('profit-loss')
export class ProfitLossController {
  constructor(private readonly profitLoss: ProfitLossService) {}

  @Get()
  @RequirePermission('expenses.view')
  generate(
    @CurrentScope() scope: Scope,
    @Query() query: ProfitLossQueryDto,
  ): Promise<ProfitLossDto> {
    return this.profitLoss.generate(scope, query);
  }
}
