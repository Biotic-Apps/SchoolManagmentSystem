import type { Readable } from 'node:stream';
import type { ImportBatch } from '../../../generated/prisma/client';
import type { Db, ImportTarget } from '../kinds/kind-handler';

/** Batch + acting user → where the rows land. */
export async function targetOf(
  db: Db,
  batch: ImportBatch,
  actorId: string,
): Promise<ImportTarget> {
  const school = await db.school.findUniqueOrThrow({
    where: { id: batch.schoolId },
    select: { code: true },
  });
  return {
    importId: batch.id,
    schoolId: batch.schoolId,
    schoolCode: school.code,
    branchId: batch.branchId,
    sessionId: batch.sessionId!,
    actorId,
  };
}

export async function streamToBuffer(stream: Readable): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of stream) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk as string));
  }
  return Buffer.concat(chunks);
}
