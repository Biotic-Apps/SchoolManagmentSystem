import { Injectable } from '@nestjs/common';
import { notFound } from '../../../core/common/errors/errors';
import { PrismaService } from '../../../core/prisma/prisma.service';
import type { Scope } from '../../../core/rbac/scope/scope';
import { SchoolPeopleService } from '../../school-day/school-people.service';
import type {
  PurchaseOrderDto,
  PurchaseRequestDto,
} from '../dto/purchasing.dto';
import {
  ORDER_INCLUDE,
  REQUEST_INCLUDE,
  toOrderDto,
  toRequestDto,
  type ItemInfo,
  type OrderRow,
  type RequestRow,
} from './purchasing.mapper';

/** Loads purchase requests/orders (scope-checked) with item names. */
@Injectable()
export class PurchasingViews {
  constructor(
    private readonly prisma: PrismaService,
    private readonly people: SchoolPeopleService,
  ) {}

  async findRequest(scope: Scope, id: string): Promise<RequestRow> {
    const row = await this.prisma.purchaseRequest.findUnique({
      where: { id },
      include: REQUEST_INCLUDE,
    });
    if (!row) throw notFound('Purchase request');
    scope.assertManageBranch({ id: row.branchId, schoolId: row.schoolId });
    return row;
  }

  async findOrder(scope: Scope, id: string): Promise<OrderRow> {
    const row = await this.prisma.purchaseOrder.findUnique({
      where: { id },
      include: ORDER_INCLUDE,
    });
    if (!row) throw notFound('Purchase order');
    scope.assertManageBranch({ id: row.branchId, schoolId: row.schoolId });
    return row;
  }

  async requests(rows: RequestRow[]): Promise<PurchaseRequestDto[]> {
    const items = await this.items(
      rows.flatMap((r) => r.order?.lines.map((l) => l.itemId) ?? []),
    );
    const names = await this.people.names(rows.map((r) => r.requestedById));
    return rows.map((row) => toRequestDto(row, items, names));
  }

  async request(row: RequestRow): Promise<PurchaseRequestDto> {
    return (await this.requests([row]))[0];
  }

  async orders(rows: OrderRow[]): Promise<PurchaseOrderDto[]> {
    const items = await this.items(
      rows.flatMap((r) => r.lines.map((l) => l.itemId)),
    );
    const bills = await this.prisma.expense.findMany({
      where: { purchaseOrderId: { in: rows.map((r) => r.id) } },
      select: { id: true, purchaseOrderId: true },
    });
    const billOf = new Map(bills.map((b) => [b.purchaseOrderId, b.id]));
    return rows.map((row) =>
      toOrderDto(row, items, billOf.get(row.id) ?? null),
    );
  }

  async orderById(id: string): Promise<PurchaseOrderDto> {
    const row = await this.prisma.purchaseOrder.findUniqueOrThrow({
      where: { id },
      include: ORDER_INCLUDE,
    });
    return (await this.orders([row]))[0];
  }

  private async items(ids: string[]): Promise<Map<string, ItemInfo>> {
    if (ids.length === 0) return new Map();
    const rows = await this.prisma.inventoryItem.findMany({
      where: { id: { in: [...new Set(ids)] } },
      select: { id: true, sku: true, name: true, unit: true },
    });
    return new Map(rows.map((r) => [r.id, r]));
  }
}
