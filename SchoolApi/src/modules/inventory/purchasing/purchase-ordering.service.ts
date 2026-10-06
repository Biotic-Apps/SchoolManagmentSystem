import { Injectable } from '@nestjs/common';
import { AuditService } from '../../../core/audit/audit.service';
import { parseDate } from '../../../core/common/dates';
import {
  conflict,
  invalid,
  notFound,
} from '../../../core/common/errors/errors';
import { schoolDate } from '../../../core/common/school-time';
import type { AuthUser } from '../../../core/common/types/auth-user';
import { PrismaService } from '../../../core/prisma/prisma.service';
import type { Scope } from '../../../core/rbac/scope/scope';
import {
  formatNumber,
  SequenceService,
} from '../../../core/sequences/sequence.service';
import { BranchAccess } from '../../expenses/branch-access';
import type { CreateOrderDto } from '../dto/purchasing-input.dto';
import type { PurchaseOrderDto } from '../dto/purchasing.dto';
import { assertUniqueItems, orderTotal } from './po-math';
import { PurchasingViews } from './purchasing-views';
import { requestLines } from './purchasing.mapper';

/** APPROVED purchase request → purchase order `PO-{BRANCH}-{YEAR}-{SEQ}`. */
@Injectable()
export class PurchaseOrderingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly access: BranchAccess,
    private readonly views: PurchasingViews,
    private readonly sequences: SequenceService,
    private readonly audit: AuditService,
  ) {}

  async order(
    user: AuthUser,
    scope: Scope,
    requestId: string,
    dto: CreateOrderDto,
  ): Promise<PurchaseOrderDto> {
    const request = await this.views.findRequest(scope, requestId);
    if (request.status !== 'APPROVED') {
      throw conflict(`Purchase request is ${request.status}, not APPROVED`);
    }
    assertUniqueItems(dto.lines);
    const requested = new Set(requestLines(request).map((l) => l.itemId));
    const extra = dto.lines.filter((l) => !requested.has(l.itemId));
    if (extra.length > 0) {
      throw invalid('Order lines must be items of the request', {
        itemIds: extra.map((l) => l.itemId),
      });
    }
    const vendor = await this.prisma.vendor.findFirst({
      where: { id: dto.vendorId, schoolId: request.schoolId, status: 'ACTIVE' },
    });
    if (!vendor) throw notFound('Vendor');
    const branch = await this.access.find(request.branchId);
    const lines = dto.lines.map((l) => ({
      itemId: l.itemId,
      quantity: l.quantity,
      unitPriceMinor: BigInt(l.unitPriceMinor),
    }));
    const total = orderTotal(lines);
    const year = Number(schoolDate().slice(0, 4));
    const orderId = await this.prisma.$transaction(async (tx) => {
      const moved = await tx.purchaseRequest.updateMany({
        where: { id: request.id, status: 'APPROVED' },
        data: { status: 'ORDERED' },
      });
      if (moved.count === 0) throw conflict('Purchase request already ordered');
      const seq = await this.sequences.next(tx, `po:${branch.id}:${year}`);
      const order = await tx.purchaseOrder.create({
        data: {
          poNo: formatNumber(`PO-${branch.code}`, year, seq),
          schoolId: request.schoolId,
          branchId: request.branchId,
          requestId: request.id,
          vendorId: vendor.id,
          totalMinor: total,
          expectedOn: dto.expectedOn ? parseDate(dto.expectedOn) : null,
          createdById: user.id,
          lines: { create: lines },
        },
      });
      this.audit.stage({
        action: 'purchase_order.create',
        entityType: 'PurchaseOrder',
        entityId: order.id,
        schoolId: order.schoolId,
        branchId: order.branchId,
        after: {
          poNo: order.poNo,
          requestId: request.id,
          vendorId: vendor.id,
          totalMinor: Number(total),
          lines: dto.lines,
        },
      });
      return order.id;
    });
    return this.views.orderById(orderId);
  }
}
