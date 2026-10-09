import { parseIdentifier } from './identifier';

describe('parseIdentifier', () => {
  it('reads an email', () => {
    expect(parseIdentifier(' Parent@X.pk ')).toEqual({ email: 'parent@x.pk' });
  });

  it('reads a phone without separators', () => {
    expect(parseIdentifier('+92 (300) 123-4567')).toEqual({
      phone: '+923001234567',
    });
  });

  it('reads a child admission number (has a letter)', () => {
    expect(parseIdentifier('sms-2026-0002')).toEqual({
      admissionNo: 'SMS-2026-0002',
    });
  });
});
