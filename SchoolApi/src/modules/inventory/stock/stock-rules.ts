import type { StockMovementType } from '../../../generated/prisma/client';
import { AppError } from '../../../core/common/errors/app-error';
import { ErrorCode } from '../../../core/common/errors/error-code.enum';
import { invalid } from '../../../core/common/errors/errors';

export interface MovementRequest {
  type: StockMovementType;
  /** Positive count; ADJUST may be negative (non-zero). */
  quantity: number;
  reason?: string | null;
  toBranchId?: string | null;
  branchId: string;
}

/**
 * Signed quantity stored for a movement: IN/TRANSFER_IN add stock,
 * ISSUE/TRANSFER_OUT remove it, ADJUST carries its own sign.
 */
export function signedQuantity(
  type: StockMovementType,
  quantity: number,
): number {
  if (!Number.isSafeInteger(quantity) || quantity === 0) {
    throw invalid('quantity must be a non-zero whole number');
  }
  if (type === 'ADJUST') return quantity;
  if (quantity < 0) throw invalid(`quantity must be positive for ${type}`);
  return type === 'IN' || type === 'TRANSFER_IN' ? quantity : -quantity;
}

/** Request-level rules (400): ADJUST needs a reason, transfers a target. */
export function validateMovement(input: MovementRequest): void {
  signedQuantity(input.type, input.quantity);
  if (input.type === 'ADJUST' && !input.reason?.trim()) {
    throw invalid('reason is required for ADJUST');
  }
  if (input.type === 'TRANSFER_IN') {
    throw invalid('TRANSFER_IN is created by the matching TRANSFER_OUT');
  }
  if (input.type === 'TRANSFER_OUT') {
    if (!input.toBranchId) throw invalid('toBranchId is required');
    if (input.toBranchId === input.branchId) {
      throw invalid('toBranchId must be another branch');
    }
  }
}

/** Stock after a movement; never negative (409 NEGATIVE_STOCK). */
export function applyMovement(current: number, delta: number): number {
  const next = current + delta;
  if (next < 0) {
    throw new AppError(
      ErrorCode.NEGATIVE_STOCK,
      `Not enough stock: ${current} available, ${-delta} requested`,
      { available: current, requested: -delta },
    );
  }
  return next;
}
