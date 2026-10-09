import { Injectable } from '@nestjs/common';
import { PasswordHasher } from '../../../core/auth/password/password-hasher';
import { generateTemporaryPassword } from '../../../core/auth/password/temporary-password';
import { SessionsService } from '../../../core/auth/sessions/sessions.service';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { ParentLoginWriter } from '../../students/registration/parent-login.writer';
import { slipAction } from './login-slip-plan';
import type { SlipGuardian } from './login-slip-plan.reader';

export interface SlipCredentials {
  /** Final action (a RESET becomes KEEP if the parent signed in meanwhile). */
  action: 'CREATE' | 'RESET' | 'KEEP' | 'SKIP';
  email: string | null;
  phone: string | null;
  temporaryPassword: string | null;
  userId: string | null;
}

/** Makes or replaces a parent's temporary password for a login slip (inside the job). */
@Injectable()
export class LoginSlipCredentials {
  constructor(
    private readonly prisma: PrismaService,
    private readonly hasher: PasswordHasher,
    private readonly sessions: SessionsService,
    private readonly logins: ParentLoginWriter,
  ) {}

  async issue(
    guardian: SlipGuardian,
    actorId: string,
  ): Promise<SlipCredentials> {
    const action = slipAction(guardian);
    const keep = (a: SlipCredentials['action'] = 'KEEP'): SlipCredentials => ({
      action: a,
      email: guardian.email,
      phone: guardian.phone,
      temporaryPassword: null,
      userId: guardian.userId,
    });
    if (action === 'SKIP' || action === 'KEEP') return keep(action);
    if (action === 'CREATE') return this.create(guardian.guardianId, actorId);
    const temporaryPassword = generateTemporaryPassword();
    // Only while still never signed in: a parent who signed in meanwhile keeps theirs.
    const updated = await this.prisma.user.updateMany({
      where: { id: guardian.userId!, lastLoginAt: null, status: 'ACTIVE' },
      data: {
        passwordHash: await this.hasher.hash(temporaryPassword),
        mustChangePassword: true,
        failedLoginCount: 0,
        lockedUntil: null,
        updatedById: actorId,
      },
    });
    if (updated.count === 0) return keep();
    await this.sessions.revokeAllForUser(guardian.userId!, {
      bumpTokenVersion: true,
    });
    return { ...keep('RESET'), temporaryPassword };
  }

  private async create(
    guardianId: string,
    actorId: string,
  ): Promise<SlipCredentials> {
    const result = await this.prisma.$transaction(async (tx) => {
      const guardian = await tx.guardian.findUniqueOrThrow({
        where: { id: guardianId },
      });
      return this.logins.ensure(tx, guardian, actorId);
    });
    const user = result.temporaryPassword
      ? await this.prisma.guardian.findUnique({
          where: { id: guardianId },
          select: { userId: true },
        })
      : null;
    return {
      action:
        result.status === 'CREATED'
          ? 'CREATE'
          : result.status === 'SKIPPED'
            ? 'SKIP'
            : 'KEEP',
      email: result.email,
      phone: result.phone,
      temporaryPassword: result.temporaryPassword,
      userId: user?.userId ?? null,
    };
  }
}
