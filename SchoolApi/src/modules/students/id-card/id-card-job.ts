import type { Prisma } from '../../../generated/prisma/client';
import type { OutboxService } from '../../../core/outbox/outbox.service';
import { QUEUES } from '../../../core/jobs/queues';

export const ID_CARD_JOB = 'documents.idCard';

export interface IdCardJobInput {
  idCardId: string;
}

/** Creates the next PENDING card version and queues rendering after commit. */
export async function queueIdCard(
  tx: Prisma.TransactionClient,
  outbox: OutboxService,
  input: { schoolId: string; studentId: string; requestedById: string },
): Promise<{ idCardId: string; outboxId: string }> {
  const last = await tx.idCard.findFirst({
    where: { studentId: input.studentId },
    orderBy: { version: 'desc' },
    select: { version: true },
  });
  const card = await tx.idCard.create({
    data: { ...input, version: (last?.version ?? 0) + 1 },
  });
  const data: IdCardJobInput = { idCardId: card.id };
  const outboxId = await outbox.add(tx, {
    queue: QUEUES.DOCUMENTS,
    name: ID_CARD_JOB,
    data,
    aggregateType: 'Student',
    aggregateId: input.studentId,
  });
  return { idCardId: card.id, outboxId };
}
