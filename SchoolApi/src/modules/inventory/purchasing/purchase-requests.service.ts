import { Injectable } from '@nestjs/common';
import type { Prisma } from '../../../generated/prisma/client';
import { ApprovalService } from '../../../core/approvals/approval.service';
import { AuditService } from '../../../core/audit/audit.service';
import { schoolDate } from '../../../core/common/school-time';
import type { PageResult } from '../../../core/common/pagination/page-result';
import {
  toPageResult,
  toSkipTake,
} from '../../../core/common/pagination/paginate';
import type { AuthUser } from '../../../core/common/types/auth-user';
import { toJson } from '../../../core/common/prisma-json';
import { PrismaService } from '../../../core/prisma/prisma.service';
import type { Scope } from '../../../core/rbac/scope/scope';
import {
  formatNumber,
  SequenceService,
} from '../../../core/sequences/sequence.service';
import { BranchAccess } from '../../expenses/branch-access';
import { ApprovalRouting } from '../../finance-core/approval-routing';
import { formatMinor } from '../../finance-core/money';
import type {
  CreatePurchaseRequestDto,
  PurchaseRequestQueryDto,
} from '../dto/purchasing-input.dto';
import type { PurchaseRequestDto } from '../dto/purchasing.dto';
import { ItemLookup } from '../items/item-lookup';
import { assertUniqueItems, orderTotal } from './po-math';
import { PurchasingViews } from './purchasing-views';
import { REQUEST_INCLUDE, type StoredRequestLine } from './purchasing.mapper';

export const PURCHASE_REQUEST_ENTITY = 'PurchaseRequest';

/** Purchase requests: PENDING → (PURCHASE_ORDER approval) → APPROVED | REJECTED. */
@Injectable()
export class PurchaseRequestsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly access: BranchAccess,
    private readonly items: ItemLookup,
    private readonly views: PurchasingViews,
    private readonly sequences: SequenceService,
    private readonly approvals: ApprovalService,
    private readonly routing: ApprovalRouting,
    private readonly audit: AuditService,
  ) {}

  async list(
    scope: Scope,
    query: PurchaseRequestQueryDto,
  ): Promise<PageResult<PurchaseRequestDto>> {
    if (query.branchId) await this.access.manage(scope, query.branchId);
    const where: Prisma.PurchaseRequestWhereInput = {
      AND: [
        scope.managedBranchFilter(),
        { branchId: query.branchId, status: query.status },
      ],
    };
    const [rows, total] = await Promise.all([
      this.prisma.purchaseRequest.findMany({
        where,
        include: REQUEST_INCLUDE,
        orderBy: { createdAt: 'desc' },
        ...toSkipTake(query),
      }),
      this.prisma.purchaseRequest.count({ where }),
    ]);
    return toPageResult(await this.views.requests(rows), total, query);
  }

  async get(scope: Scope, id: string): Promise<PurchaseRequestDto> {
    return this.views.request(await this.views.findRequest(scope, id));
  }

  async create(
    user: AuthUser,
    scope: Scope,
    dto: CreatePurchaseRequestDto,
  ): Promise<PurchaseRequestDto> {
    const branch = await this.access.manage(scope, dto.branchId);
    assertUniqueItems(dto.lines);
    const items = await this.items.forSchool(
      branch.schoolId,
      dto.lines.map((l) => l.itemId),
    );
    const lines: StoredRequestLine[] = dto.lines.map((l) => {
      const item = items.get(l.itemId)!;
      return {
        itemId: item.id,
        sku: item.sku,
        name: item.name,
        unit: item.unit,
        quantity: l.quantity,
        estimatedUnitMinor: l.estimatedUnitMinor,
      };
    });
    const total = orderTotal(
      lines.map((l) => ({
        quantity: l.quantity,
        unitPriceMinor: BigInt(l.estimatedUnitMinor),
      })),
    );
    const steps = await this.routing.steps(
      branch.id,
      'PURCHASE_ORDER',
      user.activeRole,
    );
    const year = Number(schoolDate().slice(0, 4));
    const id = await this.prisma.$transaction(async (tx) => {
      const seq = await this.sequences.next(tx, `pr:${branch.id}:${year}`);
      const request = await tx.purchaseRequest.create({
        data: {
          requestNo: formatNumber(`PR-${branch.code}`, year, seq),
          schoolId: branch.schoolId,
          branchId: branch.id,
          reason: dto.reason.trim(),
          lines: toJson(lines),
          estimatedTotalMinor: total,
          requestedById: user.id,
        },
      });
      const approval = await this.approvals.create(
        {
          type: 'PURCHASE_ORDER',
          entityType: PURCHASE_REQUEST_ENTITY,
          entityId: request.id,
          schoolId: branch.schoolId,
          branchId: branch.id,
          requestedById: user.id,
          title: `Purchase request ${request.requestNo} (${formatMinor(total)})`,
          payload: {
            requestNo: request.requestNo,
            lines,
            reason: request.reason,
          },
          reason: request.reason,
          amountMinor: total,
          steps,
        },
        tx,
      );
      await tx.purchaseRequest.update({
        where: { id: request.id },
        data: { approvalId: approval.id },
      });
      this.audit.stage({
        action: 'purchase_request.create',
        entityType: PURCHASE_REQUEST_ENTITY,
        entityId: request.id,
        schoolId: branch.schoolId,
        branchId: branch.id,
        after: {
          requestNo: request.requestNo,
          lines,
          estimatedTotalMinor: Number(total),
          approvalId: approval.id,
        },
      });
      return request.id;
    });
    return this.get(scope, id);
  }
}
