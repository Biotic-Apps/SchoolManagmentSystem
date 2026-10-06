import { Injectable } from '@nestjs/common';
import { formatDate } from '../../core/common/dates';
import { maskId } from '../../core/common/masking';
import { UrlSigner } from '../../core/files/url-signer';
import { sortRoleKeys } from '../../core/rbac/role-priority';
import type { DocumentDto } from '../documents/dto/document.dto';
import type {
  StaffAssignmentDto,
  StaffDetailDto,
  StaffSummaryDto,
} from './dto/staff.dto';
import type { AssignmentRow, StaffRow } from './staff.repository';

export function toAssignmentDto(row: AssignmentRow): StaffAssignmentDto {
  return {
    id: row.id,
    kind: row.kind,
    sessionId: row.sessionId,
    sectionId: row.sectionId,
    sectionName: row.section?.name ?? null,
    className: row.section?.schoolClass.name ?? null,
    subjectId: row.subjectId,
    subjectName: row.subject?.name ?? null,
    responsibleStaff: row.responsibleStaff,
    validUntil: row.validUntil?.toISOString() ?? null,
    isSubstitute: row.isSubstitute,
  };
}

@Injectable()
export class StaffMapper {
  constructor(private readonly signer: UrlSigner) {}

  toSummary(row: StaffRow): StaffSummaryDto {
    const sections = new Set(
      row.assignments.map((a) => a.sectionId).filter(Boolean),
    );
    const subjects = new Set(
      row.assignments.map((a) => a.subjectId).filter(Boolean),
    );
    return {
      id: row.id,
      userId: row.userId,
      name: row.name,
      photoUrl: row.photoFileId ? this.signer.sign(row.photoFileId).url : null,
      employeeNo: row.employeeNo,
      designation: row.designation,
      branchId: row.branchId,
      branchName: row.branch.name,
      status: row.status,
      roles: sortRoleKeys(
        row.user?.roleAssignments.map((a) => a.role.key) ?? [],
      ),
      requiresReview: row.requiresReview,
      reviewer: row.reviewer,
      sectionCount: sections.size,
      subjectCount: subjects.size,
    };
  }

  toDetail(
    row: StaffRow,
    documents: DocumentDto[],
    sensitive: boolean,
  ): StaffDetailDto {
    return {
      ...this.toSummary(row),
      email: row.email,
      phone: row.phone,
      cnic: sensitive ? row.cnic : maskId(row.cnic),
      qualification: row.qualification,
      joinDate: formatDate(row.joinDate),
      assignments: row.assignments.map(toAssignmentDto),
      documents,
    };
  }
}
