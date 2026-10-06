import { createHash } from 'node:crypto';
import { extname } from 'node:path';
import { Injectable } from '@nestjs/common';
import type {
  FilePurpose,
  FileScanStatus,
} from '../../generated/prisma/client';
import { AuditService } from '../audit/audit.service';
import { AppError } from '../common/errors/app-error';
import { ErrorCode } from '../common/errors/error-code.enum';
import { invalid } from '../common/errors/errors';
import { AntivirusScanner } from './antivirus/antivirus-scanner';
import { ImageProcessor } from './image/image-processor';
import { checkUpload, type UploadCandidate } from './upload-policy';

export const IMAGE_PURPOSES: ReadonlySet<FilePurpose> = new Set([
  'SCHOOL_LOGO',
  'STUDENT_PHOTO',
  'STAFF_PHOTO',
]);

export interface PreparedUpload {
  buffer: Buffer;
  mime: string;
  extension: string;
  originalName: string;
  sha256: string;
  scanStatus: FileScanStatus;
}

/**
 * Validate → re-encode images → antivirus, before anything is stored.
 * Scan status: CLEAN (scanned), PENDING (no scanner configured). INFECTED
 * uploads are rejected (400, audited) and a scanner failure fails closed
 * (503) — neither is stored.
 */
@Injectable()
export class UploadPipeline {
  constructor(
    private readonly images: ImageProcessor,
    private readonly scanner: AntivirusScanner,
    private readonly audit: AuditService,
  ) {}

  async prepare(
    file: UploadCandidate,
    purpose: FilePurpose,
    schoolId: string | null,
    fileId: string,
  ): Promise<PreparedUpload> {
    let extension = checkUpload(file, IMAGE_PURPOSES.has(purpose));
    let buffer = file.buffer;
    let mime = file.mimetype;
    if (mime.startsWith('image/')) {
      const image = await this.images.reencode(buffer);
      ({ buffer, mime, extension } = image);
    }
    const sha256 = createHash('sha256').update(buffer).digest('hex');
    const scanStatus = await this.scan(buffer, {
      purpose,
      schoolId,
      sha256,
      fileId,
    });
    const base = file.originalname.slice(
      0,
      file.originalname.length - extname(file.originalname).length,
    );
    return {
      buffer,
      mime,
      extension,
      originalName: `${base.slice(0, 190)}.${extension}`,
      sha256,
      scanStatus,
    };
  }

  private async scan(
    buffer: Buffer,
    meta: {
      purpose: FilePurpose;
      schoolId: string | null;
      sha256: string;
      fileId: string;
    },
  ): Promise<FileScanStatus> {
    const result = await this.scanner.scan(buffer);
    switch (result.status) {
      case 'SKIPPED':
        return 'PENDING';
      case 'CLEAN':
        return 'CLEAN';
      case 'INFECTED':
        // Written now: the request fails, so staged entries are not flushed.
        await this.audit.recordNow({
          action: 'file.infected',
          entityType: 'File',
          entityId: meta.fileId,
          schoolId: meta.schoolId,
          after: {
            purpose: meta.purpose,
            sha256: meta.sha256,
            signature: result.signature,
            stored: false,
          },
        });
        throw invalid('File rejected by antivirus');
      case 'FAILED':
        throw new AppError(
          ErrorCode.INTERNAL_ERROR,
          'Virus scan is unavailable; try again later',
          undefined,
          503,
        );
    }
  }
}
