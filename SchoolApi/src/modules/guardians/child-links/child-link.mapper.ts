import { fullName } from '../../students/student.mapper';
import { currentEnrollment } from '../../students/student-scope';
import type { ChildLinkRequestDto } from './child-link.dto';
import type { ChildLinkRow } from './child-links.repository';

export function toChildLinkDto(row: ChildLinkRow): ChildLinkRequestDto {
  const e = currentEnrollment(row.student.enrollments);
  return {
    id: row.id,
    guardian: {
      id: row.guardian.id,
      name: row.guardian.name,
      phone: row.guardian.phone,
    },
    student: {
      id: row.student.id,
      name: fullName(row.student),
      admissionNo: row.student.admissionNo,
      className: e?.section.schoolClass.name ?? null,
      sectionName: e?.section.name ?? null,
    },
    relation: row.relation,
    status: row.status,
    approvalId: row.approvalRequestId,
    createdAt: row.createdAt.toISOString(),
  };
}
