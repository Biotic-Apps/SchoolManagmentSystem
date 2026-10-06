import { Injectable } from '@nestjs/common';
import type { Prisma } from '../../generated/prisma/client';
import { isPrismaKnownError } from '../common/errors/prisma-error.mapper';
import { PrismaService } from '../prisma/prisma.service';

export interface ClientRequestKey {
  userId: string;
  clientRequestId?: string | null;
  action: string;
}

/**
 * Offline idempotency (contract (O)): the first call with a clientRequestId
 * applies; repeats return the current state without applying again.
 */
@Injectable()
export class ClientRequestService {
  constructor(private readonly prisma: PrismaService) {}

  async seen(key: ClientRequestKey): Promise<string | null | undefined> {
    if (!key.clientRequestId) return undefined;
    const row = await this.prisma.clientRequest.findUnique({
      where: {
        userId_clientRequestId: {
          userId: key.userId,
          clientRequestId: key.clientRequestId,
        },
      },
    });
    return row ? row.entityId : undefined;
  }

  /** Records the key inside the business transaction (a racing duplicate fails the unique). */
  async remember(
    tx: Prisma.TransactionClient,
    key: ClientRequestKey,
    entityId: string,
  ): Promise<void> {
    if (!key.clientRequestId) return;
    await tx.clientRequest.create({
      data: {
        userId: key.userId,
        clientRequestId: key.clientRequestId,
        action: key.action,
        entityId,
      },
    });
  }
}

export const isDuplicateKey = (error: unknown): boolean =>
  isPrismaKnownError(error) && error.code === 'P2002';
