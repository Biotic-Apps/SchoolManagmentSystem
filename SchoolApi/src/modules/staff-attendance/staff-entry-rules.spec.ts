import { parseDate } from '../../core/common/dates';
import {
  assertStaffEntries,
  capAtToday,
  type StaffRef,
} from './staff-entry-rules';

const staff = new Map<string, StaffRef>([
  ['t1', { id: 't1', name: 'Bilal', joinDate: parseDate('2026-04-01') }],
  ['co', { id: 'co', name: 'Coordinator', joinDate: parseDate('2026-04-01') }],
]);
const day = parseDate('2026-11-26');

describe('assertStaffEntries', () => {
  it('accepts a normal day', () => {
    expect(() =>
      assertStaffEntries(
        [
          {
            staffId: 't1',
            status: 'PRESENT',
            checkIn: '07:30',
            checkOut: '13:30',
          },
        ],
        staff,
        day,
        'co',
      ),
    ).not.toThrow();
  });

  it('blocks marking your own row (self-approval of payroll input)', () => {
    expect(() =>
      assertStaffEntries(
        [{ staffId: 'co', status: 'PRESENT' }],
        staff,
        day,
        'co',
      ),
    ).toThrow('your own attendance');
  });

  it('rejects check-out before check-in and times on an absent day', () => {
    expect(() =>
      assertStaffEntries(
        [
          {
            staffId: 't1',
            status: 'PRESENT',
            checkIn: '14:00',
            checkOut: '08:00',
          },
        ],
        staff,
        day,
        null,
      ),
    ).toThrow('check-out cannot be before check-in');
    expect(() =>
      assertStaffEntries(
        [{ staffId: 't1', status: 'ABSENT', checkIn: '07:45' }],
        staff,
        day,
        null,
      ),
    ).toThrow('only for staff who were at school');
  });

  it('rejects days before the staff member joined and unknown staff', () => {
    expect(() =>
      assertStaffEntries(
        [{ staffId: 't1', status: 'PRESENT' }],
        staff,
        parseDate('2025-01-06'),
        null,
      ),
    ).toThrow('joined on 2026-04-01');
    expect(() =>
      assertStaffEntries(
        [{ staffId: 'x', status: 'PRESENT' }],
        staff,
        day,
        null,
      ),
    ).toThrow('belong to this branch');
  });
});

describe('capAtToday', () => {
  it('stops the unmarked count at today', () => {
    const today = parseDate('2026-11-27');
    expect(capAtToday(parseDate('2026-12-31'), today)).toEqual(today);
    expect(capAtToday(parseDate('2026-11-20'), today)).toEqual(
      parseDate('2026-11-20'),
    );
  });
});
