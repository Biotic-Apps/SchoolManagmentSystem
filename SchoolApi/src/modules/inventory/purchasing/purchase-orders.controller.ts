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
import { ExpenseDto } from '../../expenses/dto/expense.dto';
import {
  PurchaseOrderQueryDto,
  ReceiveOrderDto,
} from '../dto/purchasing-input.dto';
import { PurchaseOrderDto } from '../dto/purchasing.dto';
import { PoBillingService } from './po-billing.service';
import { PurchaseOrdersService } from './purchase-orders.service';

@ApiTags('inventory')
@ApiBearerAuth()
@Controller('purchase-orders')
export class PurchaseOrdersController {
  constructor(
    private readonly orders: PurchaseOrdersService,
    private readonly billing: PoBillingService,
  ) {}

  @Get()
  @RequirePermission('inventory.view')
  @ApiPage(PurchaseOrderDto)
  list(
    @CurrentScope() scope: Scope,
    @Query() query: PurchaseOrderQueryDto,
  ): Promise<PageResult<PurchaseOrderDto>> {
    return this.orders.list(scope, query);
  }

  @Get(':id')
  @RequirePermission('inventory.view')
  @ApiData(PurchaseOrderDto)
  get(
    @CurrentScope() scope: Scope,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<PurchaseOrderDto> {
    return this.orders.get(scope, id);
  }

  @Post(':id/receive')
  @HttpCode(200)
  @RequirePermission('inventory.edit')
  @ApiData(PurchaseOrderDto)
  receive(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: ReceiveOrderDto,
  ): Promise<PurchaseOrderDto> {
    return this.orders.receive(user, scope, id, body);
  }

  @Post(':id/bill')
  @RequirePermission('expenses.add')
  @ApiData(ExpenseDto)
  bill(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ExpenseDto> {
    return this.billing.bill(user, scope, id);
  }
}
