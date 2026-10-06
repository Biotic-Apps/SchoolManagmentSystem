import { Injectable } from '@nestjs/common';
import { UrlSigner } from '../../core/files/url-signer';
import type { DocumentRow } from './documents.repository';
import type { DocumentDto } from './dto/document.dto';

@Injectable()
export class DocumentMapper {
  constructor(private readonly signer: UrlSigner) {}

  toDto(row: DocumentRow): DocumentDto {
    return {
      id: row.id,
      ownerType: row.ownerType,
      ownerId: row.ownerId,
      docType: row.docType,
      file: {
        id: row.file.id,
        url: this.signer.sign(row.file.id).url,
        mime: row.file.mime,
        size: row.file.size,
      },
      status: row.status,
      note: row.note,
      verifiedBy: row.verifiedBy,
      verifiedAt: row.verifiedAt?.toISOString() ?? null,
    };
  }
}
