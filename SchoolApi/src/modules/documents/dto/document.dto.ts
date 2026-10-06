import type {
  DocumentOwnerType,
  DocumentStatus,
  DocumentType,
} from '../../../generated/prisma/client';
import { IdNameDto } from '../../../core/common/dto/id-name.dto';

export class DocumentFileDto {
  id!: string;
  url!: string;
  mime!: string;
  size!: number;
}

export class DocumentDto {
  id!: string;
  ownerType!: DocumentOwnerType;
  ownerId!: string;
  docType!: DocumentType;
  file!: DocumentFileDto;
  status!: DocumentStatus;
  note!: string | null;
  verifiedBy!: IdNameDto | null;
  verifiedAt!: string | null;
}
