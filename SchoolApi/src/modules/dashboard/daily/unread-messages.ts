import type { PrismaService } from '../../../core/prisma/prisma.service';

/** Sent messages from others newer than the user's last read of each thread. */
export async function unreadMessageCount(
  prisma: PrismaService,
  userId: string,
): Promise<number> {
  const rows = await prisma.$queryRaw<{ count: bigint }[]>`
    SELECT count(*) AS count
    FROM messages m
    JOIN thread_participants p ON p.thread_id = m.thread_id AND p.user_id = ${userId}::uuid
    WHERE m.sender_id <> ${userId}::uuid
      AND m.status = 'SENT'
      AND (p.last_read_at IS NULL OR m.sent_at > p.last_read_at)`;
  return Number(rows[0]?.count ?? 0);
}
