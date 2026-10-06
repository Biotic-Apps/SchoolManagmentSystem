import { Injectable } from '@nestjs/common';
import type { InventoryItem } from '../../../generated/prisma/client';
import { notFound } from '../../../core/common/errors/errors';
import { AppError } from '../../../core/common/errors/app-error';
import { ErrorCode } from '../../../core/common/errors/error-code.enum';
import { PrismaService } from '../../../core/prisma/prisma.service';

/** Active items of one school by id; any missing id → 404 with details. */
@Injectable()
export class ItemLookup {
  constructor(private readonly prisma: PrismaService) {}

  async forSchool(
    schoolId: string,
    ids: string[],
  ): Promise<Map<string, InventoryItem>> {
    const unique = [...new Set(ids)];
    const rows = await this.prisma.inventoryItem.findMany({
      where: { id: { in: unique }, schoolId, status: 'ACTIVE' },
    });
    const map = new Map(rows.map((r) => [r.id, r]));
    const missing = unique.filter((id) => !map.has(id));
    if (missing.length > 0) {
      const error = notFound('Inventory item');
      throw new AppError(ErrorCode.NOT_FOUND, error.message, {
        itemIds: missing,
      });
    }
    return map;
  }
}
