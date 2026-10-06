import { Injectable } from '@nestjs/common';
import type { ExpenseCategory } from '../../../generated/prisma/client';
import { AuditService } from '../../../core/audit/audit.service';
import { invalid } from '../../../core/common/errors/errors';
import { PrismaService } from '../../../core/prisma/prisma.service';
import type { Scope } from '../../../core/rbac/scope/scope';
import { BranchAccess } from '../branch-access';
import { onDuplicate } from '../unique-conflict';
import { categoryCode } from './category-code';
import type {
  CreateExpenseCategoryDto,
  ExpenseCategoryDto,
  ExpenseCategoryQueryDto,
} from './expense-category.dto';

const toDto = (row: ExpenseCategory): ExpenseCategoryDto => ({
  id: row.id,
  schoolId: row.schoolId,
  code: row.code,
  name: row.name,
  status: row.status,
});

/** Seeded system categories plus school-defined ones (unique code). */
@Injectable()
export class ExpenseCategoriesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly access: BranchAccess,
    private readonly audit: AuditService,
  ) {}

  async list(
    scope: Scope,
    query: ExpenseCategoryQueryDto,
  ): Promise<ExpenseCategoryDto[]> {
    const schoolId = await this.access.school(scope, query);
    const rows = await this.prisma.expenseCategory.findMany({
      where: { schoolId, status: 'ACTIVE' },
      orderBy: { name: 'asc' },
    });
    return rows.map(toDto);
  }

  async create(
    scope: Scope,
    dto: CreateExpenseCategoryDto,
  ): Promise<ExpenseCategoryDto> {
    const schoolId = await this.access.school(scope, dto);
    const name = dto.name.trim();
    const code = dto.code ?? categoryCode(name);
    if (code.length < 2) throw invalid('code cannot be derived from the name');
    const row = await this.prisma.expenseCategory
      .create({ data: { schoolId, code, name } })
      .catch(onDuplicate(`Expense category ${code} already exists`));
    this.audit.stage({
      action: 'expense_category.create',
      entityType: 'ExpenseCategory',
      entityId: row.id,
      schoolId,
      after: toDto(row),
    });
    return toDto(row);
  }
}
