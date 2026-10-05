import type { SectionDto } from '../dto/section.dto';
import type { SectionRow } from './sections.repository';

export function toSectionDto(row: SectionRow): SectionDto {
  return {
    id: row.id,
    branchId: row.branchId,
    sessionId: row.sessionId,
    classId: row.classId,
    className: row.schoolClass.name,
    name: row.name,
    capacity: row.capacity,
    room: row.room,
    studentCount: 0,
    status: row.status,
  };
}
