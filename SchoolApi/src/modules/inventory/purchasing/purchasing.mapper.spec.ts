import { toRequestDto, type RequestRow } from './purchasing.mapper';

const row = {
  id: 'pr1',
  requestNo: 'PR-1',
  branchId: 'b1',
  reason: 'Restock',
  lines: [
    {
      itemId: 'i1',
      sku: 'NB',
      name: 'Notebook',
      unit: 'piece',
      quantity: 100,
      estimatedUnitMinor: 4550,
    },
  ],
  estimatedTotalMinor: 455000n,
  status: 'ORDERED',
  approvalId: null,
  requestedById: 'u1',
  decidedAt: null,
  createdAt: new Date('2026-11-27T05:00:00Z'),
  order: {
    id: 'po1',
    poNo: 'PO-1',
    status: 'PARTIALLY_RECEIVED',
    totalMinor: 440000n,
    expectedOn: new Date('2026-12-01T00:00:00Z'),
    vendor: { id: 'v1', name: 'Vendor' },
    lines: [
      {
        id: 'l1',
        itemId: 'i1',
        quantity: 100,
        receivedQty: 60,
        unitPriceMinor: 4400n,
      },
    ],
  },
} as unknown as RequestRow;

describe('toRequestDto purchase order summary', () => {
  it('sends ordered/remaining quantities and totals the web needs', () => {
    const dto = toRequestDto(
      row,
      new Map([['i1', { sku: 'NB', name: 'Notebook', unit: 'piece' }]]),
      new Map([['u1', 'Accountant']]),
    );
    expect(dto.purchaseOrder).toEqual(
      expect.objectContaining({
        totalMinor: 440000,
        receivedTotalMinor: 264000,
        expectedOn: '2026-12-01',
        lines: [
          {
            itemId: 'i1',
            itemName: 'Notebook',
            orderedQty: 100,
            receivedQty: 60,
            remainingQty: 40,
            unitPriceMinor: 4400,
            totalMinor: 440000,
          },
        ],
      }),
    );
  });
});
