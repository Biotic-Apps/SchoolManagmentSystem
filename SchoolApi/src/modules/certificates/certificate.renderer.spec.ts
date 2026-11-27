import type { AppConfigService } from '../../config/app-config.service';
import type { PrismaService } from '../../core/prisma/prisma.service';
import type { DocumentRendererRegistry } from '../generated-docs/document-renderer';
import type { CertificateContentLoader } from './certificate-content.loader';
import { CertificateRenderer } from './certificate.renderer';
import { certificateDate, certificateVerifyUrl } from './certificate-text';

const pageCount = (pdf: Buffer) =>
  (pdf.toString('latin1').match(/\/Type\s*\/Page\b/g) ?? []).length;

const cert = (duplicate: boolean) => ({
  id: 'c1',
  type: 'CHARACTER',
  serialNo: 'CERT-CHARACTER-2026-0001',
  issuedOn: new Date('2026-11-27T00:00:00.000Z'),
  duplicateOfId: duplicate ? 'c0' : null,
  reissueReason: duplicate ? 'QA original lost' : null,
  student: { firstName: 'Ali', lastName: 'Hassan', admissionNo: 'QATS-1' },
});

function renderer(duplicate: boolean, env: Record<string, unknown>) {
  const prisma = {
    certificate: {
      findUniqueOrThrow: jest.fn().mockResolvedValue(cert(duplicate)),
    },
  } as unknown as PrismaService;
  const loader = {
    load: jest.fn().mockResolvedValue({
      schoolName: 'QA Test School',
      branchLine: 'Main Campus · 1 Mall Road · 042-111',
      content: {
        type: 'CHARACTER',
        studentName: 'Ali Hassan',
        gender: 'MALE',
        guardianName: 'Hassan Ali',
        admissionNo: 'QATS-1',
        className: 'Grade 1 A',
        sessionName: '2026-27',
        admissionDate: '01-Apr-2026',
        leavingDate: null,
        purpose: 'Visa application',
        achievement: null,
        attendance: null,
      },
    }),
  } as unknown as CertificateContentLoader;
  const config = {
    get: (key: string) => env[key],
  } as unknown as AppConfigService;
  return new CertificateRenderer(
    { register: jest.fn() } as unknown as DocumentRendererRegistry,
    prisma,
    loader,
    config,
  );
}

const ENV = {
  APP_URL: 'https://api.example.org',
  PUBLIC_WEB_URL: 'https://school.example.org',
  CORS_ORIGINS: ['https://school.example.org'],
};

describe('CertificateRenderer', () => {
  // PDFKit loads its fonts on first use; slow on a busy CI machine.
  jest.setTimeout(60_000);

  it('keeps the original on one page', async () => {
    const out = await renderer(false, ENV).render('c1');
    expect(pageCount(out.buffer)).toBe(1);
  });

  it('keeps a duplicate (DUPLICATE watermark) on one page', async () => {
    const out = await renderer(true, ENV).render('c1');
    expect(pageCount(out.buffer)).toBe(1);
    expect(out.fileName).toBe(
      'certificate-CERT-CHARACTER-2026-0001-duplicate.pdf',
    );
  });
});

describe('certificate text helpers', () => {
  it('prints dates as dd-MMM-yyyy', () => {
    expect(certificateDate(new Date('2026-11-27T00:00:00.000Z'))).toBe(
      '27-Nov-2026',
    );
    expect(certificateDate(new Date('2027-03-05T00:00:00.000Z'))).toBe(
      '05-Mar-2027',
    );
  });

  it('points the QR at the web verification page when the web address is known', () => {
    expect(
      certificateVerifyUrl(
        'CERT-CHARACTER-2026-0001',
        'https://school.example.org/',
        'https://api.example.org',
        'api/v1',
      ),
    ).toBe(
      'https://school.example.org/verify/certificate/CERT-CHARACTER-2026-0001',
    );
  });

  it('falls back to the JSON endpoint without a web address', () => {
    expect(
      certificateVerifyUrl('A B', null, 'https://api.example.org/', 'api/v1'),
    ).toBe('https://api.example.org/api/v1/certificates/verify/A%20B');
  });
});
