import { formatDate } from '../../core/common/dates';
import type { AcademicSessionDto } from './dto/academic-session.dto';
import type { SessionRow } from './sessions.repository';

export function toSessionDto(row: SessionRow): AcademicSessionDto {
  return {
    id: row.id,
    branchId: row.branchId,
    name: row.name,
    startDate: formatDate(row.startDate),
    endDate: formatDate(row.endDate),
    status: row.status,
    termCount: row._count.terms,
  };
}
