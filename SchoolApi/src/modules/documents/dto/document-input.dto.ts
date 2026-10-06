import {
  IsIn,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';
import {
  DocumentOwnerType,
  DocumentType,
} from '../../../generated/prisma/client';

export class DocumentOwnerQueryDto {
  @IsIn(Object.values(DocumentOwnerType))
  ownerType!: DocumentOwnerType;

  @IsUUID()
  ownerId!: string;
}

export class AttachDocumentDto {
  @IsIn(Object.values(DocumentType))
  docType!: DocumentType;

  /** From `POST /files` with purpose DOCUMENT (or a photo purpose). */
  @IsUUID()
  fileId!: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;
}

export class CreateDocumentDto extends AttachDocumentDto {
  @IsIn(Object.values(DocumentOwnerType))
  ownerType!: DocumentOwnerType;

  @IsUUID()
  ownerId!: string;
}

export class VerifyDocumentDto {
  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;
}

export class RejectDocumentDto {
  @IsString()
  @MinLength(3)
  @MaxLength(500)
  reason!: string;
}
