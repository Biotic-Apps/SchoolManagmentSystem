import type { Prisma } from '../../../generated/prisma/client';
import type { OutboxService } from '../../../core/outbox/outbox.service';
import { QUEUES } from '../../../core/jobs/queues';

export const STAFF_ID_CARD_JOB = 'documents.staffIdCard';

export interface StaffIdCardJobInput {
  idCardId: string;
}

/** Creates the next PENDING card version and queues rendering after commit. */
export async function queueStaffIdCard(
  tx: Prisma.TransactionClient,
  outbox: OutboxService,
  input: { schoolId: string; staffId: string; requestedById: string },
): Promise<{ idCardId: string; outboxId: string }> {
  const last = await tx.staffIdCard.findFirst({
    where: { staffId: input.staffId },
    orderBy: { version: 'desc' },
    select: { version: true },
  });
  const card = await tx.staffIdCard.create({
    data: { ...input, version: (last?.version ?? 0) + 1 },
  });
  const data: StaffIdCardJobInput = { idCardId: card.id };
  const outboxId = await outbox.add(tx, {
    queue: QUEUES.DOCUMENTS,
    name: STAFF_ID_CARD_JOB,
    data,
    aggregateType: 'Staff',
    aggregateId: input.staffId,
  });
  return { idCardId: card.id, outboxId };
}
