import { IsIn } from 'class-validator';
import { FilePurpose } from '../../../generated/prisma/client';

export class UploadFileDto {
  @IsIn(Object.values(FilePurpose))
  purpose!: FilePurpose;
}

export const UPLOAD_FILE_SCHEMA = {
  type: 'object',
  required: ['file', 'purpose'],
  properties: {
    file: { type: 'string', format: 'binary' },
    purpose: { type: 'string', enum: Object.values(FilePurpose) },
  },
};
