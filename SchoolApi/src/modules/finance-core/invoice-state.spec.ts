import { parseDate } from '../../core/common/dates';
import {
  ISSUE_GRACE_DAYS,
  issueDueDate,
  settledStatus,
  shownBalanceOf,
} from './invoice-state';

describe('issueDueDate', () => {
  it('keeps the plan due date when it leaves enough time', () => {
    expect(
      issueDueDate(parseDate('2026-11-10'), parseDate('2026-11-01')),
    ).toEqual(parseDate('2026-11-10'));
  });

  it(`moves a past or too-close due date to issue date + ${ISSUE_GRACE_DAYS} days`, () => {
    const issued = parseDate('2026-11-27');
    const due = issueDueDate(parseDate('2026-11-10'), issued);
    expect(due).toEqual(parseDate('2026-12-04'));
    // So a late-issued invoice is not overdue on arrival.
    expect(
      settledStatus(
        { status: 'ISSUED', totalMinor: 500000n, paidMinor: 0n, dueDate: due },
        issued,
      ),
    ).toBe('ISSUED');
  });
});

describe('shownBalanceOf', () => {
  it('is total − paid for live invoices', () => {
    expect(
      shownBalanceOf({
        status: 'OVERDUE',
        totalMinor: 5000n,
        paidMinor: 1000n,
      }),
    ).toBe(4000n);
  });

  it('is zero for a cancelled invoice', () => {
    expect(
      shownBalanceOf({ status: 'CANCELLED', totalMinor: 5000n, paidMinor: 0n }),
    ).toBe(0n);
  });
});
