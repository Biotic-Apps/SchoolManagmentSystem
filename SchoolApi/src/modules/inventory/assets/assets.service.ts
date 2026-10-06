import { Injectable } from '@nestjs/common';
import type { Prisma } from '../../../generated/prisma/client';
import { AuditService } from '../../../core/audit/audit.service';
import {
  conflict,
  invalid,
  notFound,
} from '../../../core/common/errors/errors';
import type { PageResult } from '../../../core/common/pagination/page-result';
import {
  toPageResult,
  toSkipTake,
} from '../../../core/common/pagination/paginate';
import type { AuthUser } from '../../../core/common/types/auth-user';
import { PrismaService } from '../../../core/prisma/prisma.service';
import type { Scope } from '../../../core/rbac/scope/scope';
import { BranchAccess } from '../../expenses/branch-access';
import { onDuplicate } from '../../expenses/unique-conflict';
import type {
  AssetDto,
  AssetQueryDto,
  CreateAssetDto,
  UpdateAssetDto,
} from '../dto/asset.dto';
import { ITEM_REF_SELECT } from '../stock/movement.mapper';

const INCLUDE = {
  item: { select: ITEM_REF_SELECT },
} satisfies Prisma.AssetInclude;

type AssetRow = Prisma.AssetGetPayload<{ include: typeof INCLUDE }>;

const toAssetDto = (row: AssetRow): AssetDto => ({
  id: row.id,
  branchId: row.branchId,
  item: row.item,
  tag: row.tag,
  location: row.location,
  condition: row.condition,
  assignedTo: row.assignedTo,
  createdAt: row.createdAt.toISOString(),
  updatedAt: row.updatedAt.toISOString(),
});

/** Fixed assets: tag (unique per school), location, condition, holder. */
@Injectable()
export class AssetsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly access: BranchAccess,
    private readonly audit: AuditService,
  ) {}

  async list(
    scope: Scope,
    query: AssetQueryDto,
  ): Promise<PageResult<AssetDto>> {
    if (query.branchId) await this.access.manage(scope, query.branchId);
    const term = query.search?.trim();
    const where: Prisma.AssetWhereInput = {
      AND: [
        scope.managedBranchFilter(),
        {
          branchId: query.branchId,
          itemId: query.itemId,
          condition: query.condition,
          OR: term
            ? [
                { tag: { contains: term, mode: 'insensitive' } },
                { location: { contains: term, mode: 'insensitive' } },
                { assignedTo: { contains: term, mode: 'insensitive' } },
              ]
            : undefined,
        },
      ],
    };
    const [rows, total] = await Promise.all([
      this.prisma.asset.findMany({
        where,
        include: INCLUDE,
        orderBy: { tag: 'asc' },
        ...toSkipTake(query),
      }),
      this.prisma.asset.count({ where }),
    ]);
    return toPageResult(rows.map(toAssetDto), total, query);
  }

  async create(
    user: AuthUser,
    scope: Scope,
    dto: CreateAssetDto,
  ): Promise<AssetDto> {
    const branch = await this.access.manage(scope, dto.branchId);
    const item = await this.prisma.inventoryItem.findFirst({
      where: { id: dto.itemId, schoolId: branch.schoolId },
    });
    if (!item) throw notFound('Inventory item');
    if (!item.isAsset) throw invalid('Item is not a fixed asset');
    const row = await this.prisma.asset
      .create({
        data: {
          schoolId: branch.schoolId,
          branchId: branch.id,
          itemId: item.id,
          tag: dto.tag.trim(),
          location: dto.location.trim(),
          condition: dto.condition,
          assignedTo: dto.assignedTo?.trim() || null,
          createdById: user.id,
        },
        include: INCLUDE,
      })
      .catch(onDuplicate(`Asset tag ${dto.tag} already exists`));
    const asset = toAssetDto(row);
    this.audit.stage({
      action: 'asset.create',
      entityType: 'Asset',
      entityId: row.id,
      schoolId: row.schoolId,
      branchId: row.branchId,
      after: asset,
    });
    return asset;
  }

  async update(
    scope: Scope,
    id: string,
    dto: UpdateAssetDto,
  ): Promise<AssetDto> {
    const before = await this.prisma.asset.findUnique({
      where: { id },
      include: INCLUDE,
    });
    if (!before) throw notFound('Asset');
    scope.assertManageBranch({
      id: before.branchId,
      schoolId: before.schoolId,
    });
    if (before.condition === 'DISPOSED') {
      throw conflict('A disposed asset cannot be changed');
    }
    const row = await this.prisma.asset.update({
      where: { id },
      data: {
        location: dto.location?.trim(),
        condition: dto.condition,
        assignedTo:
          dto.assignedTo === undefined
            ? undefined
            : dto.assignedTo.trim() || null,
      },
      include: INCLUDE,
    });
    const after = toAssetDto(row);
    this.audit.stage({
      action: 'asset.update',
      entityType: 'Asset',
      entityId: id,
      schoolId: row.schoolId,
      branchId: row.branchId,
      before: toAssetDto(before),
      after,
    });
    return after;
  }
}
