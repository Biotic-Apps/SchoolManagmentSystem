import type { PersonRef } from "@/features/people/types";

// phase4-contract §E. Money is integer minor units; optional fields are tolerated when absent.

export type ItemCategory = "FURNITURE" | "COMPUTER" | "STATIONERY" | "UNIFORM" | "BOOK" | "SPORTS" | "OTHER";
export type MovementType = "IN" | "ISSUE" | "ADJUST" | "TRANSFER_OUT" | "TRANSFER_IN";
export type AssetCondition = "NEW" | "GOOD" | "FAIR" | "POOR" | "DISPOSED";
export type PurchaseRequestStatus = "PENDING" | "APPROVED" | "REJECTED" | "ORDERED";
export type PurchaseOrderStatus = "ORDERED" | "PARTIALLY_RECEIVED" | "RECEIVED" | "BILLED";

export interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  category: ItemCategory;
  unit: string;
  reorderLevel: number;
  isAsset: boolean;
  saleable: boolean;
  salePriceMinor?: number | null;
}

export interface InventoryItemInput {
  schoolId: string;
  sku: string;
  name: string;
  category: ItemCategory;
  unit: string;
  reorderLevel: number;
  isAsset: boolean;
  saleable: boolean;
  salePriceMinor?: number;
}

/** One row per item; item details may be nested or flattened. */
export interface StockRow {
  itemId?: string;
  item?: Partial<InventoryItem> | null;
  sku?: string;
  name?: string;
  category?: ItemCategory;
  unit?: string;
  reorderLevel?: number;
  quantity: number;
  lowStock?: boolean;
}

export interface MovementInput {
  branchId: string;
  itemId: string;
  type: MovementType;
  quantity: number;
  toBranchId?: string;
  issuedTo?: string;
  reason?: string;
}

export interface StockMovement {
  id: string;
  itemId: string;
  item?: Pick<InventoryItem, "id" | "name"> | null;
  type: MovementType;
  quantity: number;
  issuedTo?: string | null;
  reason?: string | null;
  createdAt: string;
  createdBy?: PersonRef | null;
}

export interface Asset {
  id: string;
  itemId: string;
  item?: Pick<InventoryItem, "id" | "name"> | null;
  tag: string;
  location: string;
  condition: AssetCondition;
  assignedTo?: string | null;
}

export interface AssetInput {
  itemId: string;
  tag: string;
  location: string;
  condition: AssetCondition;
  assignedTo?: string;
}

export interface PurchaseRequestLine {
  itemId: string;
  item?: Pick<InventoryItem, "id" | "name"> | null;
  quantity: number;
  estimatedUnitMinor: number;
}

export interface PurchaseOrderLine {
  itemId: string;
  item?: Pick<InventoryItem, "id" | "name"> | null;
  quantity: number;
  receivedQuantity?: number;
  receivedQty?: number;
  unitPriceMinor: number;
}

export interface PurchaseOrder {
  id: string;
  poNo: string;
  status: PurchaseOrderStatus;
  vendorId?: string;
  vendor?: { id: string; name: string } | null;
  expectedOn?: string | null;
  totalMinor?: number;
  expenseId?: string | null;
  lines: PurchaseOrderLine[];
}

export interface PurchaseRequest {
  id: string;
  requestNo?: string | null;
  branchId?: string;
  reason: string;
  lines: PurchaseRequestLine[];
  estimatedTotalMinor?: number;
  status: PurchaseRequestStatus;
  approvalId?: string | null;
  requestedBy?: PersonRef | null;
  createdAt?: string;
  purchaseOrder?: PurchaseOrder | null;
}

export interface PurchaseRequestInput {
  branchId: string;
  lines: { itemId: string; quantity: number; estimatedUnitMinor: number }[];
  reason: string;
}

export interface PurchaseOrderInput {
  vendorId: string;
  lines: { itemId: string; quantity: number; unitPriceMinor: number }[];
  expectedOn?: string;
}

export interface ReceiveInput {
  lines: { itemId: string; quantity: number }[];
  receivedOn: string;
}

export interface SaleInput {
  studentId: string;
  lines: { itemId: string; quantity: number }[];
}
