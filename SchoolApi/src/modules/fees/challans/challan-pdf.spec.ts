import { toChallanView, type ChallanSchool } from './challan-data';
import { ChallanPdf, copyBoxes } from './challan-pdf';

const school: ChallanSchool = {
  schoolName: 'Demo School',
  branchName: 'Main',
  branchLine: 'Main · Lahore',
  logo: null,
  bank: {
    bankName: 'HBL',
    accountTitle: 'Demo School',
    accountNumber: '0123',
    branchCode: '0456',
  },
  note: '',
};

const view = (invoiceNo: string) =>
  toChallanView(
    {
      invoiceNo,
      status: 'ISSUED',
      period: '2026-10',
      issueDate: null,
      dueDate: new Date('2026-10-10T00:00:00Z'),
      currency: 'PKR',
      lines: [{ head: 'Tuition', amountMinor: 500_000n }],
      concessionMinor: 0n,
      lateFeeMinor: 0n,
      totalMinor: 500_000n,
      paidMinor: 0n,
      lateFeeRule: null,
      student: {
        name: 'Ali',
        fatherName: null,
        admissionNo: 'A1',
        classLabel: '',
      },
      arrears: [],
    },
    school,
  );

describe('ChallanPdf', () => {
  it('splits a landscape page into three equal copies', () => {
    const boxes = copyBoxes(841.89, 595.28, 3);
    expect(boxes).toHaveLength(3);
    expect(boxes[1].x - boxes[0].x).toBeCloseTo(boxes[2].x - boxes[1].x);
    expect(boxes[2].x + boxes[2].width).toBeCloseTo(841.89 - 16);
  });

  it('renders one page per challan', async () => {
    const pdf = new ChallanPdf();
    await pdf.add(view('INV-1'));
    await pdf.add(view('INV-2'));
    const buffer = await pdf.toBuffer();
    expect(buffer.subarray(0, 4).toString()).toBe('%PDF');
    expect(pdf.pages).toBe(2);
    expect(buffer.toString('latin1').match(/\/Type \/Page\b/g)).toHaveLength(2);
  }, 30_000);
});
