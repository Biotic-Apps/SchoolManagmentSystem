import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../core/common/decorators/current-user.decorator';
import type { PageResult } from '../../core/common/pagination/page-result';
import { ApiData, ApiPage } from '../../core/common/swagger/api-data.decorator';
import type { AuthUser } from '../../core/common/types/auth-user';
import { RequirePermission } from '../../core/rbac/require-permission.decorator';
import { CurrentScope } from '../../core/rbac/scope/current-scope.decorator';
import type { Scope } from '../../core/rbac/scope/scope';
import {
  CreateExpenseDto,
  ExpensePaymentInputDto,
  ExpenseQueryDto,
  UpdateExpenseDto,
} from './dto/expense-input.dto';
import { ExpenseDto } from './dto/expense.dto';
import { ExpenseActionsService } from './expense-actions.service';
import { ExpensesService } from './expenses.service';

@ApiTags('expenses')
@ApiBearerAuth()
@Controller('expenses')
export class ExpensesController {
  constructor(
    private readonly expenses: ExpensesService,
    private readonly actions: ExpenseActionsService,
  ) {}

  @Get()
  @RequirePermission('expenses.view')
  @ApiPage(ExpenseDto)
  list(
    @CurrentScope() scope: Scope,
    @Query() query: ExpenseQueryDto,
  ): Promise<PageResult<ExpenseDto>> {
    return this.expenses.list(scope, query);
  }

  @Post()
  @RequirePermission('expenses.add')
  @ApiData(ExpenseDto)
  create(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Body() body: CreateExpenseDto,
  ): Promise<ExpenseDto> {
    return this.expenses.create(user, scope, body);
  }

  @Get(':id')
  @RequirePermission('expenses.view')
  @ApiData(ExpenseDto)
  get(
    @CurrentScope() scope: Scope,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ExpenseDto> {
    return this.expenses.get(scope, id);
  }

  @Patch(':id')
  @RequirePermission('expenses.add', 'expenses.edit')
  @ApiData(ExpenseDto)
  update(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdateExpenseDto,
  ): Promise<ExpenseDto> {
    return this.expenses.update(user, scope, id, body);
  }

  @Post(':id/submit')
  @HttpCode(200)
  @RequirePermission('expenses.add', 'expenses.submit')
  @ApiData(ExpenseDto)
  submit(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ExpenseDto> {
    return this.actions.submit(user, scope, id);
  }

  @Post(':id/payments')
  @RequirePermission('expenses.edit')
  @ApiData(ExpenseDto)
  pay(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: ExpensePaymentInputDto,
  ): Promise<ExpenseDto> {
    return this.actions.pay(user, scope, id, body);
  }
}
