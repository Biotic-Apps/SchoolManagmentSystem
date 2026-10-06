import type { CertificateType } from '../../generated/prisma/client';
import { formatNumber } from '../../core/sequences/sequence.service';

/** Sequence counter per school, type and year. */
export const certificateSequenceKey = (
  schoolId: string,
  type: CertificateType,
  year: number,
): string => `cert:${schoolId}:${type}:${year}`;

/** `CERT-SCHOOL_LEAVING-2026-0001`. */
export const certificateSerial = (
  type: CertificateType,
  year: number,
  seq: number,
): string => formatNumber(`CERT-${type}`, year, seq);
