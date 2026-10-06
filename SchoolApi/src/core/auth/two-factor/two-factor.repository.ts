import { Injectable } from '@nestjs/common';
import type { ClientPlatform } from '../../../generated/prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

export const CHALLENGE_TTL_MS = 5 * 60_000;
export const CHALLENGE_MAX_ATTEMPTS = 5;

@Injectable()
export class TwoFactorRepository {
  constructor(private readonly prisma: PrismaService) {}

  find(userId: string) {
    return this.prisma.userTwoFactor.findUnique({ where: { userId } });
  }

  /** Pending (not enabled) secret; replaces an earlier pending one. */
  savePending(userId: string, secretEnc: string) {
    return this.prisma.userTwoFactor.upsert({
      where: { userId },
      create: { userId, secretEnc },
      update: { secretEnc, enabledAt: null, lastUsedStep: null },
    });
  }

  /** Enables 2FA (only if still pending) and stores the recovery code hashes. */
  enable(userId: string, step: number, codeHashes: string[]) {
    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.userTwoFactor.updateMany({
        where: { userId, enabledAt: null },
        data: { enabledAt: new Date(), lastUsedStep: BigInt(step) },
      });
      if (updated.count === 0) return false;
      await tx.twoFactorRecoveryCode.deleteMany({ where: { userId } });
      await tx.twoFactorRecoveryCode.createMany({
        data: codeHashes.map((codeHash) => ({ userId, codeHash })),
      });
      return true;
    });
  }

  /** Accepts a TOTP step once: only when newer than the last accepted one. */
  async claimStep(userId: string, step: number): Promise<boolean> {
    const result = await this.prisma.userTwoFactor.updateMany({
      where: {
        userId,
        enabledAt: { not: null },
        OR: [{ lastUsedStep: null }, { lastUsedStep: { lt: BigInt(step) } }],
      },
      data: { lastUsedStep: BigInt(step) },
    });
    return result.count > 0;
  }

  /** Marks an unused recovery code of the user as used (single use). */
  async claimRecoveryCode(userId: string, codeHash: string): Promise<boolean> {
    const result = await this.prisma.twoFactorRecoveryCode.updateMany({
      where: { userId, codeHash, usedAt: null },
      data: { usedAt: new Date() },
    });
    return result.count > 0;
  }

  async replaceRecoveryCodes(userId: string, codeHashes: string[]) {
    await this.prisma.$transaction([
      this.prisma.twoFactorRecoveryCode.deleteMany({ where: { userId } }),
      this.prisma.twoFactorRecoveryCode.createMany({
        data: codeHashes.map((codeHash) => ({ userId, codeHash })),
      }),
    ]);
  }

  remainingRecoveryCodes(userId: string) {
    return this.prisma.twoFactorRecoveryCode.count({
      where: { userId, usedAt: null },
    });
  }

  async remove(userId: string) {
    await this.prisma.$transaction([
      this.prisma.twoFactorRecoveryCode.deleteMany({ where: { userId } }),
      this.prisma.twoFactorChallenge.deleteMany({ where: { userId } }),
      this.prisma.userTwoFactor.deleteMany({ where: { userId } }),
    ]);
  }

  createChallenge(data: {
    userId: string;
    platform: ClientPlatform;
    deviceName: string | null;
    ip: string | null;
    userAgent: string | null;
  }) {
    return this.prisma.twoFactorChallenge.create({
      data: { ...data, expiresAt: new Date(Date.now() + CHALLENGE_TTL_MS) },
      select: { id: true },
    });
  }

  findChallenge(id: string) {
    return this.prisma.twoFactorChallenge.findUnique({ where: { id } });
  }

  /** Spends one attempt of a live challenge; false when none is left. */
  async takeAttempt(id: string): Promise<boolean> {
    const result = await this.prisma.twoFactorChallenge.updateMany({
      where: {
        id,
        consumedAt: null,
        expiresAt: { gt: new Date() },
        attempts: { lt: CHALLENGE_MAX_ATTEMPTS },
      },
      data: { attempts: { increment: 1 } },
    });
    return result.count > 0;
  }

  async consumeChallenge(id: string): Promise<boolean> {
    const result = await this.prisma.twoFactorChallenge.updateMany({
      where: { id, consumedAt: null, expiresAt: { gt: new Date() } },
      data: { consumedAt: new Date() },
    });
    return result.count > 0;
  }

  /** Housekeeping: drops a user's finished or expired challenges. */
  pruneChallenges(userId: string) {
    return this.prisma.twoFactorChallenge.deleteMany({
      where: {
        userId,
        OR: [{ consumedAt: { not: null } }, { expiresAt: { lt: new Date() } }],
      },
    });
  }
}
