import {
  parseAmount,
  parseCnic,
  parseDateCell,
  parseName,
  parsePhone,
  parseYesNo,
} from './fields';

const value = <T>(r: { value: T } | { error: string }) =>
  'value' in r ? r.value : undefined;
const error = (r: { value?: unknown; error?: string }) => r.error;

describe('import field parsers', () => {
  it.each([
    ['03001234567', '+923001234567'],
    ['3001234567', '+923001234567'],
    ['+923001234567', '+923001234567'],
    ['00923001234567', '+923001234567'],
    ['0300-123 4567', '+923001234567'],
    ['923001234567', '+923001234567'],
  ])('normalises phone %s', (raw, expected) => {
    expect(value(parsePhone(raw))).toBe(expected);
  });

  it.each(['0300123456', '04235761234', '12345', '+14155550100', 'abc'])(
    'rejects phone %s',
    (raw) => {
      expect(error(parsePhone(raw))).toMatch(/mobile/);
    },
  );

  it('normalises CNIC with or without dashes', () => {
    expect(value(parseCnic('3520212345671'))).toBe('35202-1234567-1');
    expect(value(parseCnic('35202-1234567-1'))).toBe('35202-1234567-1');
    expect(error(parseCnic('35202-123456-1'))).toBeDefined();
    expect(error(parseCnic('3520212345671X'))).toBeDefined();
  });

  it('accepts both date formats and only real dates', () => {
    expect(value(parseDateCell('2026-02-28'))).toBe('2026-02-28');
    expect(value(parseDateCell('28/02/2026'))).toBe('2026-02-28');
    expect(value(parseDateCell('1/4/2026'))).toBe('2026-04-01');
    expect(value(parseDateCell('29/02/2024'))).toBe('2024-02-29');
    for (const bad of [
      '31/02/2026',
      '2026-02-30',
      '29/02/2026',
      '13/13/2026',
      '2026/01/01',
      'tomorrow',
    ]) {
      expect(error(parseDateCell(bad))).toMatch(/real date/);
    }
  });

  it('keeps Urdu and other Unicode names intact', () => {
    expect(value(parseName('علی  رضا'))).toBe('علی رضا');
    expect(value(parseName("Muhammad O'Neil-Khan Jr."))).toBe(
      "Muhammad O'Neil-Khan Jr.",
    );
    expect(value(parseName('فاطمہ بی بی'))).toBe('فاطمہ بی بی');
    expect(error(parseName('Ali123'))).toBeDefined();
    expect(error(parseName('x'.repeat(101)))).toMatch(/100/);
  });

  it('parses amounts into positive minor units', () => {
    expect(value(parseAmount('1,500.5'))).toBe(150050);
    expect(value(parseAmount('12500'))).toBe(1250000);
    expect(value(parseAmount('0.01'))).toBe(1);
    expect(error(parseAmount('-200'))).toMatch(/advance credit/);
    expect(error(parseAmount('0'))).toMatch(/greater than 0/);
    expect(error(parseAmount('10.123'))).toMatch(/2 decimals/);
  });

  it('parses yes/no', () => {
    expect(value(parseYesNo('Yes'))).toBe(true);
    expect(value(parseYesNo(''))).toBe(false);
    expect(error(parseYesNo('maybe'))).toBeDefined();
  });
});
