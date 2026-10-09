import {
  balanceLine,
  RECEIPT_COPIES,
  receiptRows,
  type ReceiptData,
} from './receipt-data';
import { renderA4Receipt } from './receipt-a4';
import {
  pair,
  renderThermalReceipt,
  THERMAL_COLUMNS,
  thermalLines,
  wrap,
} from './receipt-thermal';

const data: ReceiptData = {
  schoolName: 'Demo School',
  branchLine: 'Main Campus, Lahore',
  receiptNo: 'RCT-MAIN-2026-0001',
  receivedOn: '09-Oct-2026',
  studentName: 'Ali Khan',
  admissionNo: 'ADM-1',
  classLabel: 'Class 5 - A',
  method: 'CASH',
  reference: null,
  amountMinor: 1_200_000n,
  advanceMinor: 200_000n,
  refundedMinor: 0n,
  balanceMinor: 300_000n,
  currency: 'PKR',
  receivedBy: 'Accountant',
  allocations: [
    {
      invoiceNo: 'INV-1',
      period: 'Oct 2026',
      amountMinor: 1_000_000n,
      reversed: false,
    },
  ],
  reversed: false,
  reversalReason: null,
  amountInWords: 'Rupees Twelve Thousand Only',
  footer: '',
};

describe('receipt layouts', () => {
  it('prints a school and a student copy on A4', async () => {
    expect(RECEIPT_COPIES).toEqual(['School copy', 'Student copy']);
    const buffer = await renderA4Receipt(data);
    expect(buffer.subarray(0, 4).toString()).toBe('%PDF');
  });

  it('lists invoices, advance and the balance left', () => {
    expect(receiptRows(data)).toEqual([
      ['INV-1 · Oct 2026', 'PKR 10,000.00'],
      ['Advance credit', 'PKR 2,000.00'],
    ]);
    expect(balanceLine(data)).toEqual(['Balance due', 'PKR 3,000.00']);
    expect(balanceLine({ ...data, balanceMinor: -5_000n })).toEqual([
      'Advance credit left',
      'PKR 50.00',
    ]);
  });

  it('folds invoices beyond the limit into one row', () => {
    const allocations = Array.from({ length: 8 }, (_, i) => ({
      invoiceNo: `INV-${i}`,
      period: '',
      amountMinor: 100n,
      reversed: false,
    }));
    const rows = receiptRows({ ...data, allocations, advanceMinor: 0n }, 6);
    expect(rows).toHaveLength(6);
    expect(rows[5]).toEqual(['3 more invoices', 'PKR 3.00']);
  });

  it('keeps every thermal line within the 80 mm width', () => {
    const lines = thermalLines({
      ...data,
      schoolName: 'The Very Long Named Model Higher Secondary School System',
    });
    expect(THERMAL_COLUMNS).toBeGreaterThanOrEqual(40);
    for (const line of lines)
      expect(line.text.length).toBeLessThanOrEqual(THERMAL_COLUMNS);
    const text = lines.map((l) => l.text).join('\n');
    expect(text).toContain('PAYMENT RECEIPT');
    expect(text).toContain('Receipt  RCT-MAIN-2026-0001');
    expect(text).toMatch(/TOTAL PAID\s+PKR 12,000\.00/);
    expect(text).toMatch(/Balance due\s+PKR 3,000\.00/);
  });

  it('wraps words and right-aligns amounts', () => {
    expect(wrap('one two three', 7)).toEqual(['one two', 'three']);
    expect(wrap('abcdefghij', 4)).toEqual(['abcd', 'efgh', 'ij']);
    expect(pair('Total', 'PKR 1.00', 20)).toEqual(['Total       PKR 1.00']);
  });

  it('renders a narrow 80 mm PDF', async () => {
    const buffer = await renderThermalReceipt(data);
    const text = buffer.toString('latin1');
    expect(text).toMatch(/\/MediaBox \[0 0 226\.77/);
  });
});
