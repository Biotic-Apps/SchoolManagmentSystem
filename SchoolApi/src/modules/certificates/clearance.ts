import type { CertificateType } from '../../generated/prisma/client';

/** Certificates that need dues and returned items before approval/issue. */
export const CLEARANCE_TYPES: readonly CertificateType[] = [
  'SCHOOL_LEAVING',
  'TRANSFER',
];

export const needsClearance = (type: CertificateType): boolean =>
  CLEARANCE_TYPES.includes(type);

export interface ClearanceMovement {
  itemId: string;
  name: string;
  saleable: boolean;
  /** Signed stock quantity (issues negative, returns positive). */
  quantity: number;
}

export interface ClearanceInput {
  /** Student ledger balance (positive = owes). */
  ledgerBalanceMinor: bigint;
  /** Remaining balance of each open invoice. */
  openInvoiceBalances: readonly bigint[];
  movements: readonly ClearanceMovement[];
}

export interface UnreturnedItem {
  itemId: string;
  name: string;
  quantity: number;
}

export interface ClearanceResult {
  cleared: boolean;
  outstandingMinor: bigint;
  items: UnreturnedItem[];
}

/**
 * Leaving/transfer clearance: nothing owed (ledger or open invoices) and every
 * issued non-saleable item returned (sold items belong to the student).
 */
export function checkClearance(input: ClearanceInput): ClearanceResult {
  const invoiceDue = input.openInvoiceBalances
    .filter((b) => b > 0n)
    .reduce((sum, b) => sum + b, 0n);
  const ledgerDue =
    input.ledgerBalanceMinor > 0n ? input.ledgerBalanceMinor : 0n;
  const outstandingMinor = ledgerDue > invoiceDue ? ledgerDue : invoiceDue;

  const held = new Map<string, UnreturnedItem>();
  for (const m of input.movements) {
    if (m.saleable) continue;
    const row = held.get(m.itemId) ?? {
      itemId: m.itemId,
      name: m.name,
      quantity: 0,
    };
    row.quantity -= m.quantity;
    held.set(m.itemId, row);
  }
  const items = [...held.values()]
    .filter((i) => i.quantity > 0)
    .sort((a, b) => a.name.localeCompare(b.name));
  return {
    cleared: outstandingMinor === 0n && items.length === 0,
    outstandingMinor,
    items,
  };
}
