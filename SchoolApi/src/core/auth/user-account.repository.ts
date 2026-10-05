import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { Identifier } from './identifier';

export interface UserAuthState {
  status: 'ACTIVE' | 'DISABLED';
  tokenVersion: number;
  mustChangePassword: boolean;
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
    return this.prisma.user.findUnique({
      where: { id },
      select: { status: true, tokenVersion: true, mustChangePassword: true },
    });
  }

  recordFailure(
    id: string,
    failedLoginCount: number,
    lockedUntil: Date | null,
  ) {
    return this.prisma.user.update({
      where: { id },
      data: { failedLoginCount, lockedUntil },
    });
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
