import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { BranchTimingsInput } from '../dto/branch-timings.input';
import { defaultStaffArrival, withStaffDefaults } from './branch-timings';

const BASE = { opensAt: '08:00', closesAt: '14:00', attendanceLockAt: '10:00' };

const errorsOf = (body: object) =>
  validateSync(plainToInstance(BranchTimingsInput, body)).flatMap((e) =>
    Object.values(e.constraints ?? {}),
  );

describe('branch timings', () => {
  it('defaults staff to 30 minutes before opening and closing time', () => {
    expect(withStaffDefaults(BASE)).toEqual({
      ...BASE,
      staffArrivesAt: '07:30',
      staffLeavesAt: '14:00',
    });
  });

  it('keeps explicit staff times', () => {
    const t = { ...BASE, staffArrivesAt: '07:15', staffLeavesAt: '15:00' };
    expect(withStaffDefaults(t)).toEqual(t);
  });

  it('never defaults before midnight', () => {
    expect(defaultStaffArrival('00:10')).toBe('00:00');
    expect(defaultStaffArrival('07:45')).toBe('07:15');
  });

  it('accepts staff times around the school day', () => {
    expect(
      errorsOf({ ...BASE, staffArrivesAt: '08:00', staffLeavesAt: '14:00' }),
    ).toEqual([]);
    expect(errorsOf(BASE)).toEqual([]);
  });

  it('rejects teachers arriving after opening or leaving before closing', () => {
    expect(
      errorsOf({ ...BASE, staffArrivesAt: '08:15', staffLeavesAt: '13:00' }),
    ).toEqual([
      'staffArrivesAt must be at or before opensAt',
      'staffLeavesAt must be at or after closesAt',
    ]);
  });

  it('rejects malformed staff times', () => {
    expect(errorsOf({ ...BASE, staffArrivesAt: '7:30' })).toEqual([
      'staffArrivesAt must be HH:mm',
    ]);
  });
});
