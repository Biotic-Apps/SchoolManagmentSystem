import { maskContact, maskEmail } from './contact-mask';

describe('contact masking', () => {
  it('keeps the first character and the domain of an email', () => {
    expect(maskEmail('ayesha@bright.school')).toBe('a*****@bright.school');
    expect(maskEmail('a@x.pk')).toBe('a***@x.pk');
    expect(maskEmail('broken')).toBe('******');
  });

  it('keeps only the last 3 digits (and country prefix) of a phone', () => {
    const masked = maskContact('SMS', {
      email: null,
      phone: '+923001234567',
      devices: 0,
    });
    expect(masked).toBe('+92*******567');
    expect(masked).not.toContain('1234');
  });

  it('describes push targets by device count only', () => {
    expect(maskContact('PUSH', { email: null, phone: null, devices: 2 })).toBe(
      '2 device(s)',
    );
    expect(
      maskContact('EMAIL', { email: null, phone: null, devices: 0 }),
    ).toBeNull();
  });
});
