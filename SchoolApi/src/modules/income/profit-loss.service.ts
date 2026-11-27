import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../core/prisma/prisma.service';
import type { Scope } from '../../core/rbac/scope/scope';
import { BranchAccess } from '../expenses/branch-access';
import { loadProfitLoss, PROFIT_LOSS_BASIS } from './profit-loss-figures';

export interface ProfitLossLineDto {
  section: string;
  item: string;
  amountMinor: number;
}

export interface ProfitLossDto {
  from: string;
  to: string;
  branchId: string;
  /** Always CASH: money received and paid out in the range (see profit-loss-figures). */
  basis: typeof PROFIT_LOSS_BASIS;
  totalIncomeMinor: number;
  totalExpensesMinor: number;
  netMinor: number;
  lines: ProfitLossLineDto[];
}

interface ProfitLossQuery {
  branchId: string;
  from: string;
  to: string;
}

@Injectable()
export class ProfitLossService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly access: BranchAccess,
  ) {}

  async generate(scope: Scope, query: ProfitLossQuery): Promise<ProfitLossDto> {
    await this.access.manage(scope, query.branchId);
    const { branchId, from, to } = query;
    const figures = await loadProfitLoss(this.prisma, branchId, from, to);
    return {
      from,
      to,
      branchId,
      basis: PROFIT_LOSS_BASIS,
      totalIncomeMinor: Number(figures.totalIncomeMinor),
      totalExpensesMinor: Number(figures.totalExpensesMinor),
      netMinor: Number(figures.netMinor),
      lines: figures.lines.map((line) => ({
        section: line.section,
        item: line.item,
        amountMinor: Number(line.amountMinor),
      })),
    };
  }
}
