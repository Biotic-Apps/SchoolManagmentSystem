import { Injectable } from '@nestjs/common';
import type { Prisma } from '../../generated/prisma/client';
import { AuditService } from '../../core/audit/audit.service';
import { parseDate } from '../../core/common/dates';
import { conflict } from '../../core/common/errors/errors';
import type { PageResult } from '../../core/common/pagination/page-result';
import {
  toPageResult,
  toSkipTake,
} from '../../core/common/pagination/paginate';
import type { AuthUser } from '../../core/common/types/auth-user';
import { PrismaService } from '../../core/prisma/prisma.service';
import type { Scope } from '../../core/rbac/scope/scope';
import { BranchAccess } from './branch-access';
import type {
  CreateExpenseDto,
  ExpenseQueryDto,
  UpdateExpenseDto,
} from './dto/expense-input.dto';
import type { ExpenseDto } from './dto/expense.dto';
import { ExpenseReader } from './expense-reader';
import { assertExpenseDates, ExpenseRefs } from './expense-refs';
import { EDITABLE_STATUSES } from './expense-rules';
import { EXPENSE_INCLUDE } from './expense.mapper';

/** Expense drafts: list, read, create and edit. */
@Injectable()
export class ExpensesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly access: BranchAccess,
    private readonly reader: ExpenseReader,
    private readonly refs: ExpenseRefs,
    private readonly audit: AuditService,
  ) {}

  async list(
    scope: Scope,
    query: ExpenseQueryDto,
  ): Promise<PageResult<ExpenseDto>> {
    if (query.branchId) await this.access.manage(scope, query.branchId);
    const where: Prisma.ExpenseWhereInput = {
      AND: [
        scope.managedBranchFilter(),
        {
          branchId: query.branchId,
          categoryId: query.categoryId,
          vendorId: query.vendorId,
          status: query.status,
          billDate: {
            gte: query.from ? parseDate(query.from) : undefined,
            lte: query.to ? parseDate(query.to) : undefined,
          },
        },
      ],
    };
    const [rows, total] = await Promise.all([
      this.prisma.expense.findMany({
        where,
        include: EXPENSE_INCLUDE,
        orderBy: [{ billDate: 'desc' }, { createdAt: 'desc' }],
        ...toSkipTake(query),
      }),
      this.prisma.expense.count({ where }),
    ]);
    return toPageResult(
      rows.map((row) => this.reader.view(row)),
      total,
      query,
    );
  }

  async get(scope: Scope, id: string): Promise<ExpenseDto> {
    return this.reader.view(await this.reader.findManaged(scope, id));
  }

  async create(
    user: AuthUser,
    scope: Scope,
    dto: CreateExpenseDto,
  ): Promise<ExpenseDto> {
    const branch = await this.access.manage(scope, dto.branchId);
    const billDate = parseDate(dto.billDate);
    const dueDate = dto.dueDate ? parseDate(dto.dueDate) : null;
    const until = dto.recurring?.untilMonth ?? null;
    assertExpenseDates(billDate, dueDate, until);
    await this.refs.check(branch.schoolId, user.id, dto);
    const row = await this.prisma.expense.create({
      data: {
        schoolId: branch.schoolId,
        branchId: branch.id,
        categoryId: dto.categoryId,
        vendorId: dto.vendorId ?? null,
        title: dto.title.trim(),
        amountMinor: BigInt(dto.amountMinor),
        billDate,
        dueDate,
        billFileId: dto.billFileId ?? null,
        recurringMonthly: dto.recurring?.monthly ?? false,
        recurringUntil: dto.recurring ? until : null,
        notes: dto.notes?.trim() || null,
        createdById: user.id,
      },
      include: EXPENSE_INCLUDE,
    });
    const view = this.reader.view(row);
    this.audit.stage({
      action: 'expense.create',
      entityType: 'Expense',
      entityId: row.id,
      schoolId: row.schoolId,
      branchId: row.branchId,
      after: view,
    });
    return view;
  }

  /** Edits a DRAFT or REJECTED expense; the result is a DRAFT. */
  async update(
    user: AuthUser,
    scope: Scope,
    id: string,
    dto: UpdateExpenseDto,
  ): Promise<ExpenseDto> {
    const before = await this.reader.findManaged(scope, id);
    if (!EDITABLE_STATUSES.includes(before.status)) {
      throw conflict(`Expense is ${before.status} and cannot be edited`);
    }
    const billDate = dto.billDate ? parseDate(dto.billDate) : before.billDate;
    const dueDate =
      dto.dueDate !== undefined ? parseDate(dto.dueDate) : before.dueDate;
    const copy = before.recurringParentId !== null;
    const monthly = copy ? false : !!dto.recurring || before.recurringMonthly;
    const until = !monthly
      ? null
      : dto.recurring
        ? (dto.recurring.untilMonth ?? null)
        : before.recurringUntil;
    assertExpenseDates(billDate, dueDate, until);
    await this.refs.check(before.schoolId, user.id, dto);
    const updated = await this.prisma.expense.updateMany({
      where: { id, status: { in: EDITABLE_STATUSES } },
      data: {
        categoryId: dto.categoryId,
        vendorId: dto.vendorId,
        title: dto.title?.trim(),
        amountMinor:
          dto.amountMinor !== undefined ? BigInt(dto.amountMinor) : undefined,
        billDate,
        dueDate,
        billFileId: dto.billFileId,
        recurringMonthly: monthly,
        recurringUntil: until,
        notes: dto.notes !== undefined ? dto.notes.trim() || null : undefined,
        status: 'DRAFT',
      },
    });
    if (updated.count === 0) throw conflict('Expense changed, reload it');
    const after = await this.reader.viewById(id);
    this.audit.stage({
      action: 'expense.update',
      entityType: 'Expense',
      entityId: id,
      schoolId: before.schoolId,
      branchId: before.branchId,
      before: this.reader.view(before),
      after,
    });
    return after;
  }
}
