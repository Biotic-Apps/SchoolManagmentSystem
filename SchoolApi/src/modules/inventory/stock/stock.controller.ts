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
import {
  CreateMovementDto,
  MovementDto,
  MovementQueryDto,
  StockQueryDto,
  StockRowDto,
} from '../dto/stock.dto';
import { MovementsService } from './movements.service';
import { StockService } from './stock.service';

@ApiTags('inventory')
@ApiBearerAuth()
@Controller('inventory')
export class StockController {
  constructor(
    private readonly stock: StockService,
    private readonly movements: MovementsService,
  ) {}

  @Get('stock')
  @RequirePermission('inventory.view')
  @ApiData(StockRowDto, { isArray: true })
  list(
    @CurrentScope() scope: Scope,
    @Query() query: StockQueryDto,
  ): Promise<StockRowDto[]> {
    return this.stock.stock(scope, query.branchId);
  }

  @Get('movements')
  @RequirePermission('inventory.view')
  @ApiPage(MovementDto)
  history(
    @CurrentScope() scope: Scope,
    @Query() query: MovementQueryDto,
  ): Promise<PageResult<MovementDto>> {
    return this.stock.movements(scope, query);
  }

  @Post('movements')
  @RequirePermission('inventory.edit')
  @ApiData(MovementDto)
  move(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Body() body: CreateMovementDto,
  ): Promise<MovementDto> {
    return this.movements.create(user, scope, body);
  }
}
