import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ApiData } from '../../core/common/swagger/api-data.decorator';
import { RequirePermission } from '../../core/rbac/require-permission.decorator';
import { CurrentScope } from '../../core/rbac/scope/current-scope.decorator';
import type { Scope } from '../../core/rbac/scope/scope';
import {
  CreateIncomeCategoryDto,
  IncomeCategoryDto,
  IncomeCategoryQueryDto,
} from './dto/income-category.dto';
import { IncomeCategoriesService } from './income-categories.service';

@ApiTags('income')
@ApiBearerAuth()
@Controller('income-categories')
export class IncomeCategoriesController {
  constructor(private readonly categories: IncomeCategoriesService) {}

  @Get()
  @RequirePermission('expenses.view')
  @ApiData(IncomeCategoryDto, { isArray: true })
  list(
    @CurrentScope() scope: Scope,
    @Query() query: IncomeCategoryQueryDto,
  ): Promise<IncomeCategoryDto[]> {
    return this.categories.list(scope, query);
  }

  @Post()
  @RequirePermission('expenses.add')
  @ApiData(IncomeCategoryDto)
  create(
    @CurrentScope() scope: Scope,
    @Body() body: CreateIncomeCategoryDto,
  ): Promise<IncomeCategoryDto> {
    return this.categories.create(scope, body);
  }
}
