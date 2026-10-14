import { schoolDateTime } from '../../core/common/school-time';
import { deliversSilently } from './office-hours';

// Built on the school's clock so the test doesn't depend on the machine's TZ.
const at = (hh: number, mm = 0) =>
  schoolDateTime(
    '2026-10-06',
    `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`,
  );
const day = { from: '08:00', to: '16:00' };

describe('office hours delivery', () => {
  it('pushes inside office hours', () => {
    expect(deliversSilently(at(8, 0), day)).toBe(false);
    expect(deliversSilently(at(12, 30), day)).toBe(false);
    expect(deliversSilently(at(15, 59), day)).toBe(false);
  });

  it('delivers silently outside office hours', () => {
    expect(deliversSilently(at(7, 59), day)).toBe(true);
    expect(deliversSilently(at(16, 0), day)).toBe(true);
    expect(deliversSilently(at(22, 15), day)).toBe(true);
  });

  it('handles windows that wrap past midnight', () => {
    const night = { from: '22:00', to: '06:00' };
    expect(deliversSilently(at(23, 0), night)).toBe(false);
    expect(deliversSilently(at(5, 0), night)).toBe(false);
    expect(deliversSilently(at(12, 0), night)).toBe(true);
  });

  it('treats equal bounds as always open', () => {
    expect(deliversSilently(at(3, 0), { from: '00:00', to: '00:00' })).toBe(
      false,
    );
  });
});
