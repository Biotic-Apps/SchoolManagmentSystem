import {
  CHALLAN_COPIES,
  monthLabel,
  printDate,
  toChallanView,
  type ChallanInvoice,
  type ChallanSchool,
} from './challan-data';

const day = (d: string) => new Date(`${d}T00:00:00.000Z`);
const school: ChallanSchool = {
  schoolName: 'Demo School',
  branchName: 'Main',
  branchLine: 'Main · Lahore',
  logo: null,
  bank: null,
  note: '',
};
const invoice: ChallanInvoice = {
  invoiceNo: 'INV-MAIN-2026-0001',
  status: 'ISSUED',
  period: '2026-10',
  issueDate: day('2026-10-01'),
  dueDate: day('2026-10-10'),
  currency: 'PKR',
  lines: [
    { head: 'Tuition', amountMinor: 1_000_000n },
    { head: 'Lab', amountMinor: 100_000n },
    { head: 'Lab', amountMinor: 50_000n },
  ],
  concessionMinor: 150_000n,
  lateFeeMinor: 0n,
  totalMinor: 1_000_000n,
  paidMinor: 0n,
  lateFeeRule: { amountMinor: 50_000, afterDays: 5 },
  student: {
    name: 'Ali Khan',
    fatherName: 'Imran Khan',
    admissionNo: 'ADM-1',
    classLabel: 'Class 5 - A',
  },
  arrears: [],
};

describe('toChallanView', () => {
  it('has bank, school and parent copies', () => {
    expect(CHALLAN_COPIES).toEqual(['Bank copy', 'School copy', 'Parent copy']);
  });

  it('merges repeated fee heads and formats dates the bank way', () => {
    const view = toChallanView(invoice, school);
    expect(view.feeRows).toEqual([
      ['Tuition', 1_000_000n],
      ['Lab', 150_000n],
    ]);
    expect(view.month).toBe('Oct 2026');
    expect(view.dueDate).toBe('10-Oct-2026');
    expect(view.issueDate).toBe('01-Oct-2026');
  });

  it('adds arrears to the payable amount and names their months', () => {
    const view = toChallanView(
      {
        ...invoice,
        arrears: [
          { period: '2026-08', balanceMinor: 200_000n },
          { period: '2026-09', balanceMinor: 300_000n },
          { period: '2026-07', balanceMinor: 0n },
        ],
      },
      school,
    );
    expect(view.arrearsMinor).toBe(500_000n);
    expect(view.arrearsLabel).toBe('Arrears (Aug 2026, Sep 2026)');
    expect(view.payableMinor).toBe(1_500_000n);
    expect(view.amountInWords).toBe('Rupees Fifteen Thousand Only');
  });

  it('prints the after-due amount with the late fee and grace period', () => {
    expect(toChallanView(invoice, school).afterDue).toEqual({
      date: '15-Oct-2026',
      amountMinor: 1_050_000n,
    });
  });

  it('has no after-due amount once the late fee is charged or without a rule', () => {
    expect(
      toChallanView({ ...invoice, lateFeeMinor: 50_000n }, school).afterDue,
    ).toBeNull();
    expect(
      toChallanView({ ...invoice, lateFeeRule: null }, school).afterDue,
    ).toBeNull();
  });

  it('deducts part payments and marks paid invoices', () => {
    const partly = toChallanView({ ...invoice, paidMinor: 400_000n }, school);
    expect(partly.payableMinor).toBe(600_000n);
    const paid = toChallanView(
      { ...invoice, status: 'PAID', paidMinor: 1_000_000n },
      school,
    );
    expect(paid.payableMinor).toBe(0n);
    expect(paid.watermark).toBe('PAID');
    expect(paid.afterDue).toBeNull();
  });

  it('folds long fee lists into one Other fees row', () => {
    const lines = Array.from({ length: 13 }, (_, i) => ({
      head: `Head ${i + 1}`,
      amountMinor: 1_000n,
    }));
    const rows = toChallanView({ ...invoice, lines }, school).feeRows;
    expect(rows).toHaveLength(10);
    expect(rows[9]).toEqual(['Other fees', 4_000n]);
  });

  it('labels months and dates', () => {
    expect(monthLabel(null)).toBe('-');
    expect(monthLabel('2027-01')).toBe('Jan 2027');
    expect(printDate(day('2026-12-31'))).toBe('31-Dec-2026');
  });
});
