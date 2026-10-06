import { Body, Controller, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../../core/common/decorators/current-user.decorator';
import { ApiData } from '../../../core/common/swagger/api-data.decorator';
import type { AuthUser } from '../../../core/common/types/auth-user';
import { RequirePermission } from '../../../core/rbac/require-permission.decorator';
import { CurrentScope } from '../../../core/rbac/scope/current-scope.decorator';
import type { Scope } from '../../../core/rbac/scope/scope';
import { CreateSaleDto, SaleDto } from '../dto/sale.dto';
import { SalesService } from './sales.service';

@ApiTags('inventory')
@ApiBearerAuth()
@Controller('inventory/sales')
export class SalesController {
  constructor(private readonly sales: SalesService) {}

  @Post()
  @RequirePermission('fees.add')
  @ApiData(SaleDto)
  sell(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Body() body: CreateSaleDto,
  ): Promise<SaleDto> {
    return this.sales.sell(user, scope, body);
  }
}
