import { Module } from '@nestjs/common';
import { ExpensesModule } from '../expenses/expenses.module';
import { IncomeCategoriesController } from './income-categories.controller';
import { IncomeCategoriesService } from './income-categories.service';
import { IncomeController } from './income.controller';
import { IncomeService } from './income.service';
import { ProfitLossController } from './profit-loss.controller';
import { ProfitLossService } from './profit-loss.service';

/** Phase 5: other income (donations, rent, events, etc.) and P&L. */
@Module({
  imports: [ExpensesModule],
  controllers: [IncomeCategoriesController, IncomeController, ProfitLossController],
  providers: [IncomeCategoriesService, IncomeService, ProfitLossService],
  exports: [IncomeService],
})
export class IncomeModule {}
