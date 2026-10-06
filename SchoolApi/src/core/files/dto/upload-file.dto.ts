import { IsIn } from 'class-validator';
import { FilePurpose } from '../../../generated/prisma/client';

/** System-generated files (ID cards) cannot be uploaded. */
export const UPLOAD_PURPOSES = Object.values(FilePurpose).filter(
  (purpose) => purpose !== FilePurpose.ID_CARD,
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
