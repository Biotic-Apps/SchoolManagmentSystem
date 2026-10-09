import { renderLoginSlips, type LoginSlipContent } from './login-slip-pdf';

const slip = (over: Partial<LoginSlipContent> = {}): LoginSlipContent => ({
  schoolName: 'Bright Future School',
  logo: null,
  helpPhone: '042-111-222',
  childName: 'Ayesha Siddiqui',
  classLabel: 'Class 5 - A',
  rollNo: 3,
  admissionNo: 'BRIGHT-2026-0002',
  photo: null,
  parentName: 'Mr. Siddiqui',
  email: 'siddiqui@example.pk',
  phone: '+923001234567',
  temporaryPassword: 'Ab3dEf7hJk9m',
  loginUrl: 'https://school.example.pk/login',
  ...over,
});

describe('renderLoginSlips', () => {
  it('prints three slips per A4 page', async () => {
    const pdf = await renderLoginSlips([
      slip(),
      slip({ temporaryPassword: null }),
      slip(),
      slip(),
    ]);
    const pages = pdf.toString('latin1').match(/\/Type \/Page\b/g) ?? [];
    expect(pdf.subarray(0, 5).toString()).toBe('%PDF-');
    expect(pages).toHaveLength(2);
  }, 30_000);
});
