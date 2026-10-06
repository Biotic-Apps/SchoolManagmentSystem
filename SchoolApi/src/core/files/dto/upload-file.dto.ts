import { IsIn } from 'class-validator';
import { FilePurpose } from '../../../generated/prisma/client';

/** System-generated files (ID cards, PDFs, reports) cannot be uploaded. */
export const GENERATED_PURPOSES: ReadonlySet<FilePurpose> = new Set([
  FilePurpose.ID_CARD,
  FilePurpose.REPORT_CARD,
  FilePurpose.CHALLAN,
  FilePurpose.RECEIPT,
  FilePurpose.PAYSLIP,
  FilePurpose.CERTIFICATE,
  FilePurpose.REPORT,
]);

export const UPLOAD_PURPOSES = Object.values(FilePurpose).filter(
  (purpose) => !GENERATED_PURPOSES.has(purpose),
);

export class UploadFileDto {
  @IsIn(UPLOAD_PURPOSES)
  purpose!: FilePurpose;
}

export const UPLOAD_FILE_SCHEMA = {
  type: 'object',
  required: ['file', 'purpose'],
  properties: {
    file: { type: 'string', format: 'binary' },
    purpose: { type: 'string', enum: UPLOAD_PURPOSES },
  },
};
