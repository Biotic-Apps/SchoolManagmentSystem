import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { PageResult } from '../../../core/common/pagination/page-result';
import {
  ApiData,
  ApiPage,
} from '../../../core/common/swagger/api-data.decorator';
import { RequirePermission } from '../../../core/rbac/require-permission.decorator';
import { CurrentScope } from '../../../core/rbac/scope/current-scope.decorator';
import type { Scope } from '../../../core/rbac/scope/scope';
import { CreateItemDto, ItemDto, ItemQueryDto } from '../dto/item.dto';
import { ItemsService } from './items.service';

@ApiTags('inventory')
@ApiBearerAuth()
@Controller('inventory/items')
export class ItemsController {
  constructor(private readonly items: ItemsService) {}

  @Get()
  @RequirePermission('inventory.view')
  @ApiPage(ItemDto)
  list(
    @CurrentScope() scope: Scope,
    @Query() query: ItemQueryDto,
  ): Promise<PageResult<ItemDto>> {
    return this.items.list(scope, query);
  }

  @Post()
  @RequirePermission('inventory.add')
  @ApiData(ItemDto)
  create(
    @CurrentScope() scope: Scope,
    @Body() body: CreateItemDto,
  ): Promise<ItemDto> {
    return this.items.create(scope, body);
  }
}
