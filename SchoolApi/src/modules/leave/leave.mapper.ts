import type { Prisma } from '../../generated/prisma/client';
import { formatDate } from '../../core/common/dates';
import type { LeaveDto } from './dto/leave.dto';

export const LEAVE_INCLUDE = {
  student: { select: { id: true, firstName: true, lastName: true } },
  staff: { select: { id: true, name: true } },
  requestedBy: { select: { id: true, name: true } },
  decidedBy: { select: { id: true, name: true } },
} satisfies Prisma.LeaveRequestInclude;

export type LeaveRow = Prisma.LeaveRequestGetPayload<{
  include: typeof LEAVE_INCLUDE;
}>;

export function toLeaveDto(row: LeaveRow): LeaveDto {
  const subject = row.student
    ? {
        id: row.student.id,
        name: `${row.student.firstName} ${row.student.lastName}`,
      }
    : { id: row.staff!.id, name: row.staff!.name };
  return {
    id: row.id,
    kind: row.kind,
    subject,
    from: formatDate(row.fromDate),
    to: formatDate(row.toDate),
    days: row.days,
    type: row.type,
    reason: row.reason,
    status: row.status,
    requestedBy: row.requestedBy,
    decidedBy: row.decidedBy,
    comment: row.comment,
    approvalId: row.approvalId,
    createdAt: row.createdAt.toISOString(),
  };
}
