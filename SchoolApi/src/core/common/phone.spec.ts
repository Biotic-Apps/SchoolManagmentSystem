import { phoneVariants, toE164 } from './phone';

describe('toE164', () => {
  it.each([
    ['0300-1112233', '+923001112233'],
    ['+92 300 1112233', '+923001112233'],
    ['00923001112233', '+923001112233'],
    ['923001112233', '+923001112233'],
    ['3001112233', '+923001112233'],
    ['+447700900123', '+447700900123'],
  ])('%s → %s', (raw, expected) => {
    expect(toE164(raw, '+92')).toBe(expected);
  });

  it.each(['', 'abc', '+12', '0300-ABC', '+0123456789'])(
    'rejects %p',
    (raw) => {
      expect(toE164(raw, '+92')).toBeNull();
    },
  );

  it('lists stored variants for the default country only', () => {
    expect(phoneVariants('+923001112233', '+92')).toEqual([
      '+923001112233',
      '03001112233',
      '923001112233',
      '00923001112233',
    ]);
    expect(phoneVariants('+447700900123', '+92')).toEqual(['+447700900123']);
  });
});
