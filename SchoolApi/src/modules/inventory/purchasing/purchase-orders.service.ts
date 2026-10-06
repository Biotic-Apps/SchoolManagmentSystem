import { Injectable } from '@nestjs/common';
import type { Prisma } from '../../../generated/prisma/client';
import { AuditService } from '../../../core/audit/audit.service';
import { parseDate } from '../../../core/common/dates';
import { conflict } from '../../../core/common/errors/errors';
import type { PageResult } from '../../../core/common/pagination/page-result';
import {
  toPageResult,
  toSkipTake,
} from '../../../core/common/pagination/paginate';
import { toJson } from '../../../core/common/prisma-json';
import type { AuthUser } from '../../../core/common/types/auth-user';
import { PrismaService } from '../../../core/prisma/prisma.service';
import type { Scope } from '../../../core/rbac/scope/scope';
import { BranchAccess } from '../../expenses/branch-access';
import type {
  PurchaseOrderQueryDto,
  ReceiveOrderDto,
} from '../dto/purchasing-input.dto';
import type { PurchaseOrderDto } from '../dto/purchasing.dto';
import { StockLedger } from '../stock/stock-ledger';
import { planReceipt } from './po-math';
import { PurchasingViews } from './purchasing-views';
import { ORDER_INCLUDE } from './purchasing.mapper';

export const PURCHASE_ORDER_REF = 'PurchaseOrder';

/** Purchase orders: list, read and goods receipts (partial allowed). */
@Injectable()
export class PurchaseOrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly access: BranchAccess,
    private readonly views: PurchasingViews,
    private readonly stock: StockLedger,
    private readonly audit: AuditService,
  ) {}

  async list(
    scope: Scope,
    query: PurchaseOrderQueryDto,
  ): Promise<PageResult<PurchaseOrderDto>> {
    if (query.branchId) await this.access.manage(scope, query.branchId);
    const where: Prisma.PurchaseOrderWhereInput = {
      AND: [
        scope.managedBranchFilter(),
        {
          branchId: query.branchId,
          status: query.status,
          vendorId: query.vendorId,
        },
      ],
    };
    const [rows, total] = await Promise.all([
      this.prisma.purchaseOrder.findMany({
        where,
        include: ORDER_INCLUDE,
        orderBy: { createdAt: 'desc' },
        ...toSkipTake(query),
      }),
      this.prisma.purchaseOrder.count({ where }),
    ]);
    return toPageResult(await this.views.orders(rows), total, query);
  }

  async get(scope: Scope, id: string): Promise<PurchaseOrderDto> {
    return (
      await this.views.orders([await this.views.findOrder(scope, id)])
    )[0];
  }

  async receive(
    user: AuthUser,
    scope: Scope,
    id: string,
    dto: ReceiveOrderDto,
  ): Promise<PurchaseOrderDto> {
    await this.views.findOrder(scope, id);
    await this.prisma.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT id FROM purchase_orders WHERE id = ${id}::uuid FOR UPDATE`;
      const order = await tx.purchaseOrder.findUniqueOrThrow({
        where: { id },
        include: { lines: true },
      });
      if (order.status === 'RECEIVED' || order.status === 'BILLED') {
        throw conflict(`Purchase order is ${order.status}`);
      }
      const plan = planReceipt(order.lines, dto.lines);
      const lines = [...plan.received].map(([itemId, quantity]) => ({
        itemId,
        quantity,
      }));
      const receipt = await tx.goodsReceipt.create({
        data: {
          orderId: id,
          receivedOn: parseDate(dto.receivedOn),
          lines: toJson(lines),
          receivedById: user.id,
        },
      });
      for (const line of order.lines) {
        const quantity = plan.received.get(line.itemId);
        if (!quantity) continue;
        await tx.purchaseOrderLine.update({
          where: { id: line.id },
          data: { receivedQty: { increment: quantity } },
        });
        await this.stock.post(tx, {
          schoolId: order.schoolId,
          branchId: order.branchId,
          itemId: line.itemId,
          type: 'IN',
          quantity,
          refType: PURCHASE_ORDER_REF,
          refId: id,
          createdById: user.id,
        });
      }
      await tx.purchaseOrder.update({
        where: { id },
        data: { status: plan.status },
      });
      this.audit.stage({
        action: 'purchase_order.receive',
        entityType: 'PurchaseOrder',
        entityId: id,
        schoolId: order.schoolId,
        branchId: order.branchId,
        before: { status: order.status },
        after: { status: plan.status, receiptId: receipt.id, lines },
      });
    });
    return this.views.orderById(id);
  }
}
