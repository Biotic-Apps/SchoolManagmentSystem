import { batchFileName, batchWhere, sortBatch } from './challan-batch';

describe('challan batch', () => {
  it('prints only open invoices of the filter', () => {
    expect(
      batchWhere({
        branchId: 'b',
        period: '2026-10',
        classId: 'c',
        sectionId: null,
      }),
    ).toEqual({
      branchId: 'b',
      period: '2026-10',
      status: { in: ['ISSUED', 'PARTIALLY_PAID', 'OVERDUE'] },
      classId: 'c',
    });
  });

  it('orders by class level, section, then student', () => {
    expect(
      sortBatch([
        { id: '1', classOrder: 2, sectionName: 'A', studentName: 'Zara' },
        { id: '2', classOrder: 1, sectionName: 'B', studentName: 'Ali' },
        { id: '3', classOrder: 1, sectionName: 'A', studentName: 'Sara' },
        { id: '4', classOrder: 1, sectionName: 'A', studentName: 'Ahmed' },
      ]),
    ).toEqual(['4', '3', '2', '1']);
  });

  it('names the file after branch, month and class', () => {
    expect(batchFileName('MAIN', '2026-10', null)).toBe(
      'challans-MAIN-2026-10.pdf',
    );
    expect(batchFileName('MAIN', '2026-10', 'Class 5 A')).toBe(
      'challans-MAIN-2026-10-class-5-a.pdf',
    );
  });
});
