import { parseDate } from '../../core/common/dates';
import { assertDueDate, publishedEditable } from './diary-rules';

describe('publishedEditable', () => {
  const day = parseDate('2026-11-27');

  it('allows edits all day long, also after the closing time', () => {
    expect(publishedEditable(day, new Date('2026-11-27T14:20:00Z'))).toBe(true); // 19:20 PKT
    expect(publishedEditable(day, new Date('2026-11-27T18:59:00Z'))).toBe(true); // 23:59 PKT
  });

  it('closes the entry once its day is over', () => {
    expect(publishedEditable(day, new Date('2026-11-27T19:00:00Z'))).toBe(
      false,
    ); // 00:00 PKT next day
  });
});

describe('assertDueDate', () => {
  it('rejects a due date before the diary date', () => {
    const date = parseDate('2026-11-27');
    expect(() => assertDueDate(date, parseDate('2026-11-20'))).toThrow(
      'cannot be before',
    );
    expect(() => assertDueDate(date, parseDate('2026-11-27'))).not.toThrow();
    expect(() => assertDueDate(date, null)).not.toThrow();
  });
});
