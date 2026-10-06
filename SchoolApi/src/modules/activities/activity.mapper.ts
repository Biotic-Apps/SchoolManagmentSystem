import type { ConsentStatus, Prisma } from '../../generated/prisma/client';
import { formatDate } from '../../core/common/dates';
import { readAudience } from './activity-audience';
import type { ActivityDto } from './dto/activity.dto';

export const ACTIVITY_INCLUDE = {
  proposedBy: { select: { id: true, name: true } },
} satisfies Prisma.ActivityInclude;

export type ActivityRow = Prisma.ActivityGetPayload<{
  include: typeof ACTIVITY_INCLUDE;
}>;

export function toActivityDto(
  row: ActivityRow,
  myConsent?: ConsentStatus | null,
): ActivityDto {
  const dto: ActivityDto = {
    id: row.id,
    branchId: row.branchId,
    type: row.type,
    title: row.title,
    description: row.description,
    startAt: row.startAt.toISOString(),
    endAt: row.endAt.toISOString(),
    venue: row.venue,
    audience: readAudience(row.audience),
    consentRequired: row.consentRequired,
    consentDeadline: row.consentDeadline
      ? formatDate(row.consentDeadline)
      : null,
    feeMinor: row.feeMinor === null ? null : Number(row.feeMinor),
    maxParticipants: row.maxParticipants,
    status: row.status,
    reason: row.reason,
    proposedBy: row.proposedBy,
    approvalId: row.approvalId,
    createdAt: row.createdAt.toISOString(),
  };
  if (myConsent !== undefined) dto.myConsent = myConsent;
  return dto;
}
