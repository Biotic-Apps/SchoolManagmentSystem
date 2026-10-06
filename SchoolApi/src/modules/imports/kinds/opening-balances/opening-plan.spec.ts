import { mapSheet } from '../../validation/sheet';
import { planOpeningBalances, reconcileOpening } from './opening-plan';
import { OpeningValidator, type OpeningContext } from './opening-validator';

const line = (row: number, studentId: string, amountMinor: number) => ({
  row,
  admissionNo: `ADM-${studentId}`,
  studentId,
  amountMinor,
  asOfDate: '2026-03-31',
});

describe('opening balances planning', () => {
  it('totals one line per student and reconciles with the ledger', () => {
    const plan = planOpeningBalances([line(2, 'a', 150050), line(3, 'b', 1)]);
    expect(plan).toMatchObject({ fileTotalMinor: 150051, students: 2 });
    expect(reconcileOpening(plan, 150051)).toEqual({
      fileTotalMinor: 150051,
      importedTotalMinor: 150051,
      students: 2,
      matches: true,
    });
    expect(reconcileOpening(plan, 150050).matches).toBe(false);
  });

  it('never sums a student twice and refuses non-positive amounts', () => {
    expect(() =>
      planOpeningBalances([line(2, 'a', 5), line(3, 'a', 7)]),
    ).toThrow(/appears twice/);
    expect(() => planOpeningBalances([line(2, 'a', 0)])).toThrow(/positive/);
  });

  it('validates rows: duplicates, unknown students, negatives, future dates', () => {
    const validator = new OpeningValidator();
    const sheet = mapSheet(
      [
        ['Admission no', 'Amount', 'As of date'],
        ['A1', '1,000.50', '31/03/2026'],
        ['A1', '200', '2026-03-31'],
        ['A2', '-50', '2026-03-31'],
        ['NOPE', '10', '2027-01-01'],
        ['A3', '10', '2026-03-31'],
      ],
      validator.columns,
    );
    const rows = sheet.rows.map((r) => validator.parse(r));
    const ctx: OpeningContext = {
      students: new Map([
        ['A1', { id: 's1', sectionId: null, classId: null }],
        ['A2', { id: 's2', sectionId: null, classId: null }],
        ['A3', { id: 's3', sectionId: null, classId: null }],
      ]),
      withOpening: new Set(['s3']),
      today: '2026-10-06',
    };
    validator.check(rows, ctx);
    expect(rows[0].errors).toEqual([]);
    expect(rows[0].data).toMatchObject({
      amountMinor: 100050,
      asOfDate: '2026-03-31',
      studentId: 's1',
    });
    expect(rows[1].errors[0].message).toMatch(/Duplicate/);
    expect(rows[2].errors[0].message).toMatch(
      /advance credit: record as a payment/,
    );
    expect(rows[3].errors.map((e) => e.column)).toEqual([
      'As of date',
      'Admission no',
    ]);
    expect(rows[4].errors[0].message).toMatch(/already has an opening balance/);
  });
});
