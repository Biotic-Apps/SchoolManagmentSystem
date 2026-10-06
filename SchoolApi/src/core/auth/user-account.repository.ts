import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { Identifier } from './identifier';

export interface UserAuthState {
  status: 'ACTIVE' | 'DISABLED';
  tokenVersion: number;
  mustChangePassword: boolean;
  twoFactorEnabled: boolean;
}

@Injectable()
export class UserAccountRepository {
  constructor(private readonly prisma: PrismaService) {}

  findByIdentifier(identifier: Identifier) {
    return this.prisma.user.findFirst({
      where: identifier.email
        ? { email: identifier.email }
        : { phone: identifier.phone },
    });
  }

  findById(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async findState(id: string): Promise<UserAuthState | null> {
    const row = await this.prisma.user.findUnique({
      where: { id },
      select: {
        status: true,
        tokenVersion: true,
        mustChangePassword: true,
        twoFactor: { select: { enabledAt: true } },
      },
    });
    if (!row) return null;
    const { twoFactor, ...state } = row;
    return { ...state, twoFactorEnabled: !!twoFactor?.enabledAt };
  }

  /** Atomically adds one failed attempt; returns the new count. */
  async incrementFailures(id: string): Promise<number> {
    const row = await this.prisma.user.update({
      where: { id },
      data: { failedLoginCount: { increment: 1 } },
      select: { failedLoginCount: true },
    });
    return row.failedLoginCount;
  }

  /** Locks once the threshold is reached (counter restarts after the lock). */
  async lock(id: string, threshold: number, until: Date): Promise<boolean> {
    const result = await this.prisma.user.updateMany({
      where: { id, failedLoginCount: { gte: threshold } },
      data: { failedLoginCount: 0, lockedUntil: until },
    });
    return result.count > 0;
  }

  recordLogin(id: string) {
    return this.prisma.user.update({
      where: { id },
      data: { failedLoginCount: 0, lockedUntil: null, lastLoginAt: new Date() },
    });
  }

  setPassword(
    id: string,
    passwordHash: string,
    options: { mustChangePassword: boolean; bumpTokenVersion: boolean },
  ) {
    return this.prisma.user.update({
      where: { id },
      data: {
        passwordHash,
        mustChangePassword: options.mustChangePassword,
        failedLoginCount: 0,
        lockedUntil: null,
        ...(options.bumpTokenVersion && { tokenVersion: { increment: 1 } }),
      },
    });
  }

  bumpTokenVersion(id: string) {
    return this.prisma.user.update({
      where: { id },
      data: { tokenVersion: { increment: 1 } },
    });
  }
}
