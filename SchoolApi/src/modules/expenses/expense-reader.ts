import { Injectable } from '@nestjs/common';
import type { Prisma } from '../../generated/prisma/client';
import { notFound } from '../../core/common/errors/errors';
import { UrlSigner } from '../../core/files/url-signer';
import { PrismaService } from '../../core/prisma/prisma.service';
import type { Scope } from '../../core/rbac/scope/scope';
import type { ExpenseDto } from './dto/expense.dto';
import {
  EXPENSE_INCLUDE,
  toExpenseDto,
  type ExpenseRow,
} from './expense.mapper';

/** Loads expenses (scope-checked) and turns them into API DTOs. */
@Injectable()
export class ExpenseReader {
  constructor(
    private readonly prisma: PrismaService,
    private readonly signer: UrlSigner,
  ) {}

  async find(
    id: string,
    tx: Prisma.TransactionClient = this.prisma,
  ): Promise<ExpenseRow> {
    const row = await tx.expense.findUnique({
      where: { id },
      include: EXPENSE_INCLUDE,
    });
    if (!row) throw notFound('Expense');
    return row;
  }

  /** Expense of a branch the caller manages (403 otherwise). */
  async findManaged(
    scope: Scope,
    id: string,
    tx: Prisma.TransactionClient = this.prisma,
  ): Promise<ExpenseRow> {
    const row = await this.find(id, tx);
    scope.assertManageBranch({ id: row.branchId, schoolId: row.schoolId });
    return row;
  }

  view(row: ExpenseRow): ExpenseDto {
    const url = row.billFileId ? this.signer.sign(row.billFileId).url : null;
    return toExpenseDto(row, url);
  }

  async viewById(id: string): Promise<ExpenseDto> {
    return this.view(await this.find(id));
  }
}
