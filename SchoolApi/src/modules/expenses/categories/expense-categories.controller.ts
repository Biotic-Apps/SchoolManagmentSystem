import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ApiData } from '../../../core/common/swagger/api-data.decorator';
import { RequirePermission } from '../../../core/rbac/require-permission.decorator';
import { CurrentScope } from '../../../core/rbac/scope/current-scope.decorator';
import type { Scope } from '../../../core/rbac/scope/scope';
import {
  CreateExpenseCategoryDto,
  ExpenseCategoryDto,
  ExpenseCategoryQueryDto,
} from './expense-category.dto';
import { ExpenseCategoriesService } from './expense-categories.service';

@ApiTags('expenses')
@ApiBearerAuth()
@Controller('expense-categories')
export class ExpenseCategoriesController {
  constructor(private readonly categories: ExpenseCategoriesService) {}

  @Get()
  @RequirePermission('expenses.view')
  @ApiData(ExpenseCategoryDto, { isArray: true })
  list(
    @CurrentScope() scope: Scope,
    @Query() query: ExpenseCategoryQueryDto,
  ): Promise<ExpenseCategoryDto[]> {
    return this.categories.list(scope, query);
  }

  @Post()
  @RequirePermission('expenses.add')
  @ApiData(ExpenseCategoryDto)
  create(
    @CurrentScope() scope: Scope,
    @Body() body: CreateExpenseCategoryDto,
  ): Promise<ExpenseCategoryDto> {
    return this.categories.create(scope, body);
  }
}
