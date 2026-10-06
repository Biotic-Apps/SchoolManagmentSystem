import { ApiProperty } from '@nestjs/swagger';
import {
  PurchaseOrderStatus,
  PurchaseRequestStatus,
} from '../../../generated/prisma/client';
import { IdNameDto } from '../../../core/common/dto/id-name.dto';

export class RequestLineDto {
  itemId!: string;
  sku!: string;
  itemName!: string;
  unit!: string;
  quantity!: number;
  estimatedUnitMinor!: number;
  totalMinor!: number;
}

export class OrderSummaryLineDto {
  itemId!: string;
  itemName!: string;
  orderedQty!: number;
  receivedQty!: number;
  unitPriceMinor!: number;
}

export class OrderSummaryDto {
  id!: string;
  poNo!: string;
  vendor!: IdNameDto;
  lines!: OrderSummaryLineDto[];
  @ApiProperty({ enum: PurchaseOrderStatus })
  status!: PurchaseOrderStatus;
}

export class PurchaseRequestDto {
  id!: string;
  requestNo!: string;
  branchId!: string;
  reason!: string;
  lines!: RequestLineDto[];
  estimatedTotalMinor!: number;
  @ApiProperty({ enum: PurchaseRequestStatus })
  status!: PurchaseRequestStatus;
  approvalId!: string | null;
  requestedBy!: IdNameDto | null;
  decidedAt!: string | null;
  purchaseOrder!: OrderSummaryDto | null;
  createdAt!: string;
}

export class OrderLineDto {
  id!: string;
  itemId!: string;
  sku!: string;
  itemName!: string;
  unit!: string;
  orderedQty!: number;
  receivedQty!: number;
  remainingQty!: number;
  unitPriceMinor!: number;
  totalMinor!: number;
}

export class ReceiptLineDto {
  itemId!: string;
  quantity!: number;
}

export class GoodsReceiptDto {
  id!: string;
  receivedOn!: string;
  lines!: ReceiptLineDto[];
  receivedById!: string;
  createdAt!: string;
}

export class PurchaseOrderDto {
  id!: string;
  poNo!: string;
  branchId!: string;
  requestId!: string;
  requestNo!: string;
  vendor!: IdNameDto;
  @ApiProperty({ enum: PurchaseOrderStatus })
  status!: PurchaseOrderStatus;
  totalMinor!: number;
  receivedTotalMinor!: number;
  expectedOn!: string | null;
  lines!: OrderLineDto[];
  receipts!: GoodsReceiptDto[];
  /** Vendor bill (expense) once billed. */
  expenseId!: string | null;
  createdAt!: string;
}
