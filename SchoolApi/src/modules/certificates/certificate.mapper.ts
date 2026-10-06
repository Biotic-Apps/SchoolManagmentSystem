import type { Prisma } from '../../generated/prisma/client';
import { formatDate } from '../../core/common/dates';
import { fullName } from '../students/student.mapper';
import type { CertificateDto } from './dto/certificate.dto';

export const CERTIFICATE_INCLUDE = {
  student: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      admissionNo: true,
      enrollments: {
        orderBy: [{ startDate: 'desc' }, { createdAt: 'desc' }],
        take: 1,
        select: {
          section: {
            select: { name: true, schoolClass: { select: { name: true } } },
          },
        },
      },
    },
  },
} satisfies Prisma.CertificateInclude;

export type CertificateRow = Prisma.CertificateGetPayload<{
  include: typeof CERTIFICATE_INCLUDE;
}>;

/** User ids whose names a list of rows needs. */
export const personIds = (rows: CertificateRow[]): string[] =>
  rows.flatMap((r) => [r.requestedById, r.decidedById ?? r.requestedById]);

const APPROVED_STATES = new Set(['APPROVED', 'ISSUED']);

export function toCertificateDto(
  row: CertificateRow,
  names: Map<string, string>,
  fileUrl: string | null,
): CertificateDto {
  const section = row.student.enrollments[0]?.section ?? null;
  const person = (id: string) => ({ id, name: names.get(id) ?? '' });
  return {
    id: row.id,
    branchId: row.branchId,
    serialNo: row.serialNo,
    type: row.type,
    status: row.status,
    student: {
      id: row.student.id,
      name: fullName(row.student),
      admissionNo: row.student.admissionNo,
      className: section?.schoolClass.name ?? null,
      sectionName: section?.name ?? null,
    },
    purpose: row.purpose,
    details: (row.details as Record<string, unknown> | null) ?? null,
    requestedBy: person(row.requestedById),
    requestedAt: row.createdAt.toISOString(),
    approvedBy:
      row.decidedById && APPROVED_STATES.has(row.status)
        ? person(row.decidedById)
        : null,
    issuedAt: row.issuedOn ? formatDate(row.issuedOn) : null,
    effectiveDate: row.effectiveDate ? formatDate(row.effectiveDate) : null,
    isDuplicate: row.duplicateOfId !== null,
    duplicateOfId: row.duplicateOfId,
    reissueReason: row.reissueReason,
    rejectionReason: row.rejectReason,
    fileUrl,
  };
}
