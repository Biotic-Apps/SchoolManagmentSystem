import { deliversSilently } from './office-hours';

const at = (hh: number, mm = 0) => new Date(2026, 9, 6, hh, mm);
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
