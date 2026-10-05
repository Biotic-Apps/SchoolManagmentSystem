import { extname } from 'node:path';
import { AppError } from '../common/errors/app-error';
import { ErrorCode } from '../common/errors/error-code.enum';
import { invalid } from '../common/errors/errors';

const MB = 1024 * 1024;

interface MimeRule {
  extensions: string[];
  maxBytes: number;
  matches: (head: Buffer) => boolean;
}

const startsWith = (bytes: number[]) => (head: Buffer) =>
  bytes.every((byte, i) => head[i] === byte);

/** security.md §6 allow-list: jpg, png, webp, pdf, docx. */
export const UPLOAD_RULES: Record<string, MimeRule> = {
  'image/jpeg': {
    extensions: ['jpg', 'jpeg'],
    maxBytes: 5 * MB,
    matches: startsWith([0xff, 0xd8, 0xff]),
  },
  'image/png': {
    extensions: ['png'],
    maxBytes: 5 * MB,
    matches: startsWith([0x89, 0x50, 0x4e, 0x47]),
  },
  'image/webp': {
    extensions: ['webp'],
    maxBytes: 5 * MB,
    matches: (head) =>
      head.toString('latin1', 0, 4) === 'RIFF' &&
      head.toString('latin1', 8, 12) === 'WEBP',
  },
  'application/pdf': {
    extensions: ['pdf'],
    maxBytes: 10 * MB,
    matches: startsWith([0x25, 0x50, 0x44, 0x46]),
  },
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': {
    extensions: ['docx'],
    maxBytes: 10 * MB,
    matches: startsWith([0x50, 0x4b, 0x03, 0x04]),
  },
};

export const MAX_UPLOAD_BYTES = 10 * MB;

export interface UploadCandidate {
  originalname: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

/** Checks MIME, extension, size and file signature; returns the extension. */
export function checkUpload(
  file: UploadCandidate,
  imagesOnly: boolean,
): string {
  const rule = UPLOAD_RULES[file.mimetype];
  const extension = extname(file.originalname).slice(1).toLowerCase();
  if (!rule || !rule.extensions.includes(extension)) {
    throw invalid('File type not allowed', {
      allowed: Object.keys(UPLOAD_RULES),
    });
  }
  if (imagesOnly && !file.mimetype.startsWith('image/')) {
    throw invalid('An image (jpg, png, webp) is required');
  }
  if (file.size > rule.maxBytes) {
    throw new AppError(
      ErrorCode.PAYLOAD_TOO_LARGE,
      `File exceeds ${rule.maxBytes / MB} MB`,
    );
  }
  if (!rule.matches(file.buffer.subarray(0, 12))) {
    throw invalid('File content does not match its type');
  }
  return extension;
}
