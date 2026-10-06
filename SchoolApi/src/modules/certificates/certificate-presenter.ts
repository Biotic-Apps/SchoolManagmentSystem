import { Injectable } from '@nestjs/common';
import type { AuthUser } from '../../core/common/types/auth-user';
import { GeneratedDocumentService } from '../generated-docs/generated-document.service';
import { SchoolPeopleService } from '../school-day/school-people.service';
import {
  personIds,
  toCertificateDto,
  type CertificateRow,
} from './certificate.mapper';
import type { CertificateDto } from './dto/certificate.dto';

/** Rows → DTOs with user names and the latest PDF link. */
@Injectable()
export class CertificatePresenter {
  constructor(
    private readonly people: SchoolPeopleService,
    private readonly documents: GeneratedDocumentService,
  ) {}

  async many(rows: CertificateRow[]): Promise<CertificateDto[]> {
    if (rows.length === 0) return [];
    const [names, docs] = await Promise.all([
      this.people.names(personIds(rows)),
      this.documents.latestMany(
        'CERTIFICATE',
        rows.map((r) => r.id),
      ),
    ]);
    return rows.map((row) =>
      toCertificateDto(
        row,
        names,
        this.documents.view(docs.get(row.id) ?? null)?.fileUrl ?? null,
      ),
    );
  }

  async one(row: CertificateRow): Promise<CertificateDto> {
    const [dto] = await this.many([row]);
    return dto;
  }

  /**
   * Single read: an issued certificate without a PDF (e.g. seeded, or a failed
   * render) gets one requested; `fileUrl` stays null until it is READY.
   */
  async withDocument(
    user: AuthUser,
    row: CertificateRow,
  ): Promise<CertificateDto> {
    const dto = await this.one(row);
    if (row.status !== 'ISSUED' || dto.fileUrl) return dto;
    const latest = await this.documents.latest('CERTIFICATE', row.id);
    if (latest?.status === 'PENDING') return dto;
    await this.documents.request(user, {
      kind: 'CERTIFICATE',
      entityId: row.id,
      schoolId: row.schoolId,
      ownerUserId: row.issuedById ?? user.id,
      fresh: latest?.status === 'FAILED',
    });
    return { ...dto, fileUrl: null };
  }
}
