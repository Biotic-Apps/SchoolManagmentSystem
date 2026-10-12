import { Body, Controller, Delete, Get, HttpCode, Param, ParseUUIDPipe, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../core/common/decorators/current-user.decorator';
import type { PageResult } from '../../core/common/pagination/page-result';
import { ApiData, ApiPage } from '../../core/common/swagger/api-data.decorator';
import type { AuthUser } from '../../core/common/types/auth-user';
import { RequirePermission } from '../../core/rbac/require-permission.decorator';
import { CurrentScope } from '../../core/rbac/scope/current-scope.decorator';
import type { Scope } from '../../core/rbac/scope/scope';
import { CreateIncomeDto, IncomeQueryDto, UpdateIncomeDto } from './dto/income-input.dto';
import { IncomeDto } from './dto/income.dto';
import { IncomeService } from './income.service';

@ApiTags('income')
@ApiBearerAuth()
@Controller('income')
export class IncomeController {
  constructor(private readonly income: IncomeService) {}

  @Get()
  @RequirePermission('expenses.view')
  @ApiPage(IncomeDto)
  list(
    @CurrentScope() scope: Scope,
    @Query() query: IncomeQueryDto,
  ): Promise<PageResult<IncomeDto>> {
    return this.income.list(scope, query);
  }

  @Post()
  @RequirePermission('expenses.add')
  @ApiData(IncomeDto)
  create(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Body() body: CreateIncomeDto,
  ): Promise<IncomeDto> {
    return this.income.create(user, scope, body);
  }

  @Get(':id')
  @RequirePermission('expenses.view')
  @ApiData(IncomeDto)
  get(
    @CurrentScope() scope: Scope,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<IncomeDto> {
    return this.income.get(scope, id);
  }

  @Patch(':id')
  @RequirePermission('expenses.add', 'expenses.edit')
  @ApiData(IncomeDto)
  update(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdateIncomeDto,
  ): Promise<IncomeDto> {
    return this.income.update(user, scope, id, body);
  }

  @Delete(':id')
  @HttpCode(204)
  @RequirePermission('expenses.add', 'expenses.edit')
  remove(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<void> {
    return this.income.remove(user, scope, id);
  }
}
