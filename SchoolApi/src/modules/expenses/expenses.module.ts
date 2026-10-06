import { Module } from '@nestjs/common';
import { BranchAccess } from './branch-access';
import { ExpenseCategoriesController } from './categories/expense-categories.controller';
import { ExpenseCategoriesService } from './categories/expense-categories.service';
import { ExpenseActionsService } from './expense-actions.service';
import { ExpenseApprovalHandler } from './expense-approval.handler';
import { ExpenseReader } from './expense-reader';
import { ExpenseRefs } from './expense-refs';
import { ExpenseSubmission } from './expense-submission';
import { ExpensesController } from './expenses.controller';
import { ExpensesService } from './expenses.service';
import { RecurringExpensesProcessor } from './jobs/recurring-expenses.processor';
import { VendorsController } from './vendors/vendors.controller';
import { VendorsService } from './vendors/vendors.service';

/** Phase 4 §D: vendors, expense categories, expenses and vendor bills. */
@Module({
  controllers: [
    VendorsController,
    ExpenseCategoriesController,
    ExpensesController,
  ],
  providers: [
    BranchAccess,
    VendorsService,
    ExpenseCategoriesService,
    ExpensesService,
    ExpenseActionsService,
    ExpenseReader,
    ExpenseRefs,
    ExpenseSubmission,
    ExpenseApprovalHandler,
    RecurringExpensesProcessor,
  ],
  exports: [BranchAccess, ExpenseReader, ExpenseSubmission],
})
export class ExpensesModule {}
