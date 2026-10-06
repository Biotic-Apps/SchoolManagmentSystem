import { Injectable } from '@nestjs/common';
import type { StudentHealthProfile } from '../../generated/prisma/client';
import { formatDate } from '../../core/common/dates';
import { maskId } from '../../core/common/masking';
import { UrlSigner } from '../../core/files/url-signer';
import type { DocumentDto } from '../documents/dto/document.dto';
import type {
  EnrollmentDto,
  StudentDetailDto,
  StudentSummaryDto,
} from './dto/student.dto';
import { toGuardianLinkDto } from './guardian.mapper';
import { currentEnrollment } from './student-scope';
import type {
  EnrollmentRow,
  GuardianLinkRow,
  StudentRow,
} from './students.repository';

export interface DetailParts {
  links: GuardianLinkRow[];
  documents: DocumentDto[];
  health: StudentHealthProfile | null;
  /** `people.sensitive.view` */
  sensitive: boolean;
  /** `health.view` */
  medical: boolean;
}

export const fullName = (row: { firstName: string; lastName: string }) =>
  `${row.firstName} ${row.lastName}`.trim();

export function toEnrollmentDto(row: EnrollmentRow): EnrollmentDto {
  return {
    id: row.id,
    branchId: row.branchId,
    branchName: row.branch.name,
    sessionId: row.sessionId,
    sessionName: row.session.name,
    sectionId: row.sectionId,
    className: row.section.schoolClass.name,
    sectionName: row.section.name,
    rollNo: row.rollNo,
    startDate: formatDate(row.startDate),
    endDate: row.endDate ? formatDate(row.endDate) : null,
    status: row.status,
    reason: row.reason,
  };
}

@Injectable()
export class StudentMapper {
  constructor(private readonly signer: UrlSigner) {}

  photoUrl(fileId: string | null): string | null {
    return fileId ? this.signer.sign(fileId).url : null;
  }

  toSummary(row: StudentRow): StudentSummaryDto {
    const current = currentEnrollment(row.enrollments);
    const primary = row.guardianLinks[0]?.guardian ?? null;
    return {
      id: row.id,
      admissionNo: row.admissionNo,
      name: fullName(row),
      photoUrl: this.photoUrl(row.photoFileId),
      gender: row.gender,
      dob: formatDate(row.dob),
      className: current?.section.schoolClass.name ?? null,
      sectionName: current?.section.name ?? null,
      sectionId: current?.sectionId ?? null,
      branchName: current?.branch.name ?? null,
      rollNo: current?.rollNo ?? null,
      status: row.status,
      primaryGuardian: primary && { name: primary.name, phone: primary.phone },
    };
  }

  toDetail(row: StudentRow, parts: DetailParts): StudentDetailDto {
    const current = currentEnrollment(row.enrollments);
    const health = parts.health;
    return {
      ...this.toSummary(row),
      firstName: row.firstName,
      lastName: row.lastName,
      bForm: parts.sensitive ? row.bForm : maskId(row.bForm),
      address: row.address,
      admissionDate: formatDate(row.admissionDate),
      enrollment: current && toEnrollmentDto(current),
      guardians: parts.links.map((link) =>
        toGuardianLinkDto(link, parts.sensitive),
      ),
      documents: parts.documents,
      medical:
        parts.medical && health
          ? {
              allergies: health.allergies,
              conditions: health.conditions,
              notes: health.notes,
            }
          : null,
    };
  }
}
