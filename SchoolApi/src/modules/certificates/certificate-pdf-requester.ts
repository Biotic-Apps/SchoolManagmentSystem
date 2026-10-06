import { Injectable } from '@nestjs/common';
import type { AuthUser } from '../../core/common/types/auth-user';
import { PrismaService } from '../../core/prisma/prisma.service';
import { GeneratedDocumentService } from '../generated-docs/generated-document.service';
import { CertificatePresenter } from './certificate-presenter';
import type { CertificateRow } from './certificate.mapper';
import type { CertificateDto } from './dto/certificate.dto';

/** Starts the CERTIFICATE PDF job (file owned by the issuer) and links it. */
@Injectable()
export class CertificatePdfRequester {
  constructor(
    private readonly prisma: PrismaService,
    private readonly documents: GeneratedDocumentService,
    private readonly presenter: CertificatePresenter,
  ) {}

  async request(user: AuthUser, row: CertificateRow): Promise<CertificateDto> {
    const { jobId, documentId } = await this.documents.request(user, {
      kind: 'CERTIFICATE',
      entityId: row.id,
      schoolId: row.schoolId,
      ownerUserId: user.id,
    });
    await this.prisma.certificate.update({
      where: { id: row.id },
      data: { documentId },
    });
    const dto = await this.presenter.one(row);
    return { ...dto, jobId };
  }
}
