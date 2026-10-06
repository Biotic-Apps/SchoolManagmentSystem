import { Injectable } from '@nestjs/common';
import type {
  InventoryItem,
  Prisma,
  RecordStatus,
} from '../../../generated/prisma/client';
import { AuditService } from '../../../core/audit/audit.service';
import { invalid } from '../../../core/common/errors/errors';
import type { PageResult } from '../../../core/common/pagination/page-result';
import { toPageResult } from '../../../core/common/pagination/paginate';
import { PrismaService } from '../../../core/prisma/prisma.service';
import type { Scope } from '../../../core/rbac/scope/scope';
import { BranchAccess } from '../../expenses/branch-access';
import { onDuplicate } from '../../expenses/unique-conflict';
import type { CreateItemDto, ItemDto, ItemQueryDto } from '../dto/item.dto';
import { StockLedger } from '../stock/stock-ledger';

const MAX_ITEMS = 2000;

export function toItemDto(row: InventoryItem, stock: number | null): ItemDto {
  return {
    id: row.id,
    schoolId: row.schoolId,
    sku: row.sku,
    name: row.name,
    category: row.category,
    unit: row.unit,
    reorderLevel: row.reorderLevel,
    isAsset: row.isAsset,
    saleable: row.saleable,
    salePriceMinor:
      row.salePriceMinor === null ? null : Number(row.salePriceMinor),
    status: row.status,
    stock,
    lowStock: stock === null ? null : stock <= row.reorderLevel,
    createdAt: row.createdAt.toISOString(),
  };
}

/** School-wide item catalogue with per-branch stock. */
@Injectable()
export class ItemsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly access: BranchAccess,
    private readonly stock: StockLedger,
    private readonly audit: AuditService,
  ) {}

  async list(scope: Scope, query: ItemQueryDto): Promise<PageResult<ItemDto>> {
    if (query.lowStock && !query.branchId) {
      throw invalid('branchId is required with lowStock');
    }
    const schoolId = await this.access.school(scope, query);
    const term = query.search?.trim();
    const where: Prisma.InventoryItemWhereInput = {
      schoolId,
      category: query.category,
      status: (query.status as RecordStatus | undefined) ?? 'ACTIVE',
      OR: term
        ? [
            { name: { contains: term, mode: 'insensitive' } },
            { sku: { contains: term, mode: 'insensitive' } },
          ]
        : undefined,
    };
    const rows = await this.prisma.inventoryItem.findMany({
      where,
      orderBy: { name: 'asc' },
      take: MAX_ITEMS,
    });
    const stock = query.branchId
      ? await this.stock.quantities(query.branchId)
      : null;
    let items = rows.map((row) =>
      toItemDto(row, stock ? (stock.get(row.id) ?? 0) : null),
    );
    if (query.lowStock) items = items.filter((item) => item.lowStock);
    const start = (query.page - 1) * query.pageSize;
    return toPageResult(
      items.slice(start, start + query.pageSize),
      items.length,
      query,
    );
  }

  async create(scope: Scope, dto: CreateItemDto): Promise<ItemDto> {
    const schoolId = await this.access.school(scope, dto);
    if (dto.saleable && dto.salePriceMinor === undefined) {
      throw invalid('salePriceMinor is required for saleable items');
    }
    const row = await this.prisma.inventoryItem
      .create({
        data: {
          schoolId,
          sku: dto.sku.trim(),
          name: dto.name.trim(),
          category: dto.category,
          unit: dto.unit.trim(),
          reorderLevel: dto.reorderLevel,
          isAsset: dto.isAsset,
          saleable: dto.saleable,
          salePriceMinor:
            dto.salePriceMinor === undefined
              ? null
              : BigInt(dto.salePriceMinor),
        },
      })
      .catch(onDuplicate(`SKU ${dto.sku} already exists`));
    const item = toItemDto(row, null);
    this.audit.stage({
      action: 'inventory_item.create',
      entityType: 'InventoryItem',
      entityId: row.id,
      schoolId,
      after: item,
    });
    return item;
  }
}
