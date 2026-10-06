import { Injectable } from '@nestjs/common';
import type { Prisma } from '../../../generated/prisma/client';
import { formatDate, parseDate } from '../../../core/common/dates';
import type { PageResult } from '../../../core/common/pagination/page-result';
import {
  toPageResult,
  toSkipTake,
} from '../../../core/common/pagination/paginate';
import { schoolDateTime } from '../../../core/common/school-time';
import { PrismaService } from '../../../core/prisma/prisma.service';
import type { Scope } from '../../../core/rbac/scope/scope';
import { SchoolPeopleService } from '../../school-day/school-people.service';
import { BranchAccess } from '../../expenses/branch-access';
import type {
  MovementDto,
  MovementQueryDto,
  StockRowDto,
} from '../dto/stock.dto';
import {
  ITEM_REF_SELECT,
  MOVEMENT_INCLUDE,
  toMovementDto,
} from './movement.mapper';
import { StockLedger } from './stock-ledger';

const DAY_MS = 86_400_000;

/** Read side: stock per item and the movement history. */
@Injectable()
export class StockService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly access: BranchAccess,
    private readonly ledger: StockLedger,
    private readonly people: SchoolPeopleService,
  ) {}

  async stock(scope: Scope, branchId: string): Promise<StockRowDto[]> {
    const branch = await this.access.manage(scope, branchId);
    const items = await this.prisma.inventoryItem.findMany({
      where: { schoolId: branch.schoolId, status: 'ACTIVE' },
      select: { ...ITEM_REF_SELECT, reorderLevel: true },
      orderBy: { name: 'asc' },
    });
    const stock = await this.ledger.quantities(branch.id);
    return items.map(({ reorderLevel, ...item }) => {
      const quantity = stock.get(item.id) ?? 0;
      return {
        item,
        quantity,
        reorderLevel,
        lowStock: quantity <= reorderLevel,
      };
    });
  }

  async movements(
    scope: Scope,
    query: MovementQueryDto,
  ): Promise<PageResult<MovementDto>> {
    if (query.branchId) await this.access.manage(scope, query.branchId);
    const where: Prisma.StockMovementWhereInput = {
      AND: [
        scope.managedBranchFilter(),
        {
          branchId: query.branchId,
          itemId: query.itemId,
          studentId: query.studentId,
          createdAt: {
            gte: query.from ? schoolDateTime(query.from, '00:00') : undefined,
            lt: query.to
              ? schoolDateTime(nextDay(query.to), '00:00')
              : undefined,
          },
        },
      ],
    };
    const [rows, total] = await Promise.all([
      this.prisma.stockMovement.findMany({
        where,
        include: MOVEMENT_INCLUDE,
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        ...toSkipTake(query),
      }),
      this.prisma.stockMovement.count({ where }),
    ]);
    const names = await this.people.names(rows.map((r) => r.createdById));
    return toPageResult(
      rows.map((row) => toMovementDto(row, names)),
      total,
      query,
    );
  }
}

const nextDay = (date: string): string =>
  formatDate(new Date(parseDate(date).getTime() + DAY_MS));
