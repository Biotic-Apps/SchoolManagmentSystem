import {
  Body,
  Controller,
  Get,
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
import {
  CreateOrderDto,
  CreatePurchaseRequestDto,
  PurchaseRequestQueryDto,
} from '../dto/purchasing-input.dto';
import { PurchaseOrderDto, PurchaseRequestDto } from '../dto/purchasing.dto';
import { PurchaseOrderingService } from './purchase-ordering.service';
import { PurchaseRequestsService } from './purchase-requests.service';

@ApiTags('inventory')
@ApiBearerAuth()
@Controller('purchase-requests')
export class PurchaseRequestsController {
  constructor(
    private readonly requests: PurchaseRequestsService,
    private readonly ordering: PurchaseOrderingService,
  ) {}

  @Get()
  @RequirePermission('inventory.view')
  @ApiPage(PurchaseRequestDto)
  list(
    @CurrentScope() scope: Scope,
    @Query() query: PurchaseRequestQueryDto,
  ): Promise<PageResult<PurchaseRequestDto>> {
    return this.requests.list(scope, query);
  }

  @Post()
  @RequirePermission('inventory.add')
  @ApiData(PurchaseRequestDto)
  create(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Body() body: CreatePurchaseRequestDto,
  ): Promise<PurchaseRequestDto> {
    return this.requests.create(user, scope, body);
  }

  @Get(':id')
  @RequirePermission('inventory.view')
  @ApiData(PurchaseRequestDto)
  get(
    @CurrentScope() scope: Scope,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<PurchaseRequestDto> {
    return this.requests.get(scope, id);
  }

  @Post(':id/order')
  @RequirePermission('inventory.edit')
  @ApiData(PurchaseOrderDto)
  order(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: CreateOrderDto,
  ): Promise<PurchaseOrderDto> {
    return this.ordering.order(user, scope, id, body);
  }
}
