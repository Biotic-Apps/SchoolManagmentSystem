import { emailFrom } from './email-from';

describe('emailFrom', () => {
  it('keeps the configured name and address', () => {
    expect(emailFrom('eSchool <no-reply@school.pk>')).toBe(
      '"eSchool" <no-reply@school.pk>',
    );
  });

  it('uses the school display name when set', () => {
    expect(emailFrom('eSchool <no-reply@school.pk>', 'Bright Future')).toBe(
      '"Bright Future" <no-reply@school.pk>',
    );
  });

  it('accepts a bare address and strips injection characters', () => {
    expect(emailFrom('no-reply@school.pk')).toBe('no-reply@school.pk');
    expect(emailFrom('no-reply@school.pk', 'A <evil@x.com>"')).toBe(
      '"A evil@x.com" <no-reply@school.pk>',
    );
  });
});
