import { formatDate } from '../../../core/common/dates';
import { fullName } from '../student.mapper';
import type { TransferDto } from './dto/transfer.dto';
import type { TransferRow } from './transfers.repository';

export function toTransferDto(row: TransferRow): TransferDto {
  return {
    id: row.id,
    student: {
      id: row.student.id,
      name: fullName(row.student),
      admissionNo: row.student.admissionNo,
    },
    fromBranch: { id: row.fromBranch.id, name: row.fromBranch.name },
    toBranch: { id: row.toBranch.id, name: row.toBranch.name },
    effectiveDate: formatDate(row.effectiveDate),
    reason: row.reason,
    status: row.status,
    decisionReason: row.decisionReason,
    createdAt: row.createdAt.toISOString(),
  };
}
