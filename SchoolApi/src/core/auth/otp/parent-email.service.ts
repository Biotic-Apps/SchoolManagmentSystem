import { Injectable } from '@nestjs/common';
import type { User } from '../../../generated/prisma/client';
import { AccessCache } from '../../rbac/access/access-cache';
import { RoleKey } from '../../rbac/role-key.enum';
import { LoginOtpRepository } from './login-otp.repository';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Who may sign in with an email code: parents only (security.md §1). */
@Injectable()
export class ParentEmailService {
  constructor(
    private readonly repository: LoginOtpRepository,
    private readonly access: AccessCache,
  ) {}

  /** Trimmed, lower-cased address, or null when it is not an email. */
  normalize(raw: string): string | null {
    const value = raw.trim().toLowerCase();
    return value.length <= 254 && EMAIL.test(value) ? value : null;
  }

  /** The one ACTIVE user with this email, when they hold an active PARENT role. */
  async findParent(email: string): Promise<User | null> {
    const users = await this.repository.activeUsersByEmail(email);
    if (users.length !== 1) return null;
    return (await this.isParent(users[0].id)) ? users[0] : null;
  }

  async isParent(userId: string): Promise<boolean> {
    const assignments = await this.access.assignments(userId);
    return assignments.some((a) => a.roleKey === (RoleKey.PARENT as string));
  }
}
