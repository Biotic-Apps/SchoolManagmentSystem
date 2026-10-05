import { Injectable } from '@nestjs/common';
import type { ClientPlatform } from '../../../generated/prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

export interface NewSession {
  userId: string;
  familyId: string;
  tokenHash: string;
  deviceName: string | null;
  platform: ClientPlatform;
  ip: string | null;
  userAgent: string | null;
  expiresAt: Date;
}

@Injectable()
export class RefreshSessionRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: NewSession) {
    return this.prisma.refreshSession.create({ data });
  }

  findByHash(tokenHash: string) {
    return this.prisma.refreshSession.findUnique({ where: { tokenHash } });
  }

  /** Revokes `oldId` and links it to the new token; false if it was already used. */
  rotate(oldId: string, next: NewSession): Promise<boolean> {
    return this.prisma.$transaction(async (tx) => {
      const created = await tx.refreshSession.create({ data: next });
      const updated = await tx.refreshSession.updateMany({
        where: { id: oldId, revokedAt: null },
        data: { revokedAt: new Date(), replacedById: created.id },
      });
      if (updated.count === 0) {
        await tx.refreshSession.delete({ where: { id: created.id } });
        return false;
      }
      return true;
    });
  }

  revokeFamily(familyId: string) {
    return this.prisma.refreshSession.updateMany({
      where: { familyId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  /** Active family ids of a user, optionally keeping one. */
  async activeFamilies(userId: string, exceptFamilyId?: string) {
    const rows = await this.prisma.refreshSession.findMany({
      where: {
        userId,
        revokedAt: null,
        expiresAt: { gt: new Date() },
        ...(exceptFamilyId && { familyId: { not: exceptFamilyId } }),
      },
      select: { familyId: true },
    });
    return [...new Set(rows.map((row) => row.familyId))];
  }

  revokeFamilies(familyIds: string[]) {
    return this.prisma.refreshSession.updateMany({
      where: { familyId: { in: familyIds }, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  async isFamilyActive(familyId: string): Promise<boolean> {
    const count = await this.prisma.refreshSession.count({
      where: { familyId, revokedAt: null, expiresAt: { gt: new Date() } },
    });
    return count > 0;
  }

  /** Current (head) token of each active family, with the family start time. */
  async listActive(userId: string) {
    const heads = await this.prisma.refreshSession.findMany({
      where: { userId, revokedAt: null, expiresAt: { gt: new Date() } },
      orderBy: { lastUsedAt: 'desc' },
    });
    const starts = await this.prisma.refreshSession.groupBy({
      by: ['familyId'],
      where: { familyId: { in: heads.map((h) => h.familyId) } },
      _min: { createdAt: true },
    });
    const startOf = new Map(
      starts.map((s) => [s.familyId, s._min.createdAt ?? undefined]),
    );
    return heads.map((head) => ({
      ...head,
      familyCreatedAt: startOf.get(head.familyId) ?? head.createdAt,
    }));
  }

  familyOwner(familyId: string) {
    return this.prisma.refreshSession.findFirst({
      where: { familyId },
      select: { userId: true },
    });
  }
}
