import { Injectable, OnModuleInit } from '@nestjs/common';
import { toBuffer as qrToBuffer } from 'qrcode';
import { API_PREFIX } from '../../bootstrap/configure-app';
import { AppConfigService } from '../../config/app-config.service';
import { formatDate } from '../../core/common/dates';
import { PrismaService } from '../../core/prisma/prisma.service';
import {
  DocumentRendererRegistry,
  type DocumentRenderer,
  type RenderedDocument,
} from '../generated-docs/document-renderer';
import { PdfBuilder } from '../generated-docs/pdf-builder';
import { fullName } from '../students/student.mapper';
import { CertificateContentLoader } from './certificate-content.loader';
import { CERTIFICATE_TITLES, certificateBody } from './certificate-text';

/** CERTIFICATE PDFs: body text, serial, QR to the public verify endpoint. */
@Injectable()
export class CertificateRenderer implements DocumentRenderer, OnModuleInit {
  readonly kind = 'CERTIFICATE' as const;

  constructor(
    private readonly registry: DocumentRendererRegistry,
    private readonly prisma: PrismaService,
    private readonly loader: CertificateContentLoader,
    private readonly config: AppConfigService,
  ) {}

  onModuleInit(): void {
    this.registry.register(this);
  }

  async render(entityId: string): Promise<RenderedDocument> {
    const cert = await this.prisma.certificate.findUniqueOrThrow({
      where: { id: entityId },
      include: { student: true },
    });
    if (!cert.serialNo || !cert.issuedOn) {
      throw new Error('Certificate is not issued');
    }
    const loaded = await this.loader.load(cert);
    const duplicate = cert.duplicateOfId !== null;
    const base = this.config.get('APP_URL').replace(/\/$/, '');
    const verifyUrl = `${base}/${API_PREFIX}/certificates/verify/${encodeURIComponent(cert.serialNo)}`;
    const qr = await qrToBuffer(verifyUrl, { margin: 0, width: 200 });

    const pdf = new PdfBuilder().header(
      loaded.schoolName,
      loaded.branchLine,
      CERTIFICATE_TITLES[cert.type],
    );
    if (duplicate) pdf.watermark('DUPLICATE');
    pdf.fields([
      ['Serial No', cert.serialNo],
      ['Issue date', formatDate(cert.issuedOn)],
      ['Student', fullName(cert.student)],
      ['Admission No', cert.student.admissionNo],
      ['Class', loaded.content.className ?? '-'],
      ['Guardian', loaded.content.guardianName ?? '-'],
      ['Admission date', loaded.content.admissionDate],
      ['Leaving date', loaded.content.leavingDate ?? '-'],
    ]);
    pdf.doc.moveDown(1);
    for (const line of certificateBody(loaded.content)) {
      pdf.paragraph(line, { align: 'justify', size: 11 });
    }
    if (duplicate) {
      pdf.paragraph(
        `DUPLICATE copy issued on ${formatDate(cert.issuedOn)}${cert.reissueReason ? ` (${cert.reissueReason})` : ''}. The original serial number remains valid.`,
        { size: 9 },
      );
    }
    pdf.doc.moveDown(3);
    pdf.paragraph('______________________\nPrincipal', { size: 10 });
    pdf.qr(qr, `Verify: ${cert.serialNo}`);
    pdf.footer(`${cert.serialNo} · verify at ${verifyUrl}`);
    return {
      buffer: await pdf.toBuffer(),
      fileName: `certificate-${cert.serialNo}${duplicate ? '-duplicate' : ''}.pdf`,
    };
  }
}
