import { Injectable } from '@nestjs/common';
import type { User } from '../../../generated/prisma/client';
import { AppConfigService } from '../../../config/app-config.service';
import { phoneVariants, toE164 } from '../../common/phone';
import { AccessCache } from '../../rbac/access/access-cache';
import { RoleKey } from '../../rbac/role-key.enum';
import { LoginOtpRepository } from './login-otp.repository';

/** Who may sign in with a phone code: parents only (security.md §1). */
@Injectable()
export class ParentPhoneService {
  constructor(
    private readonly config: AppConfigService,
    private readonly repository: LoginOtpRepository,
    private readonly access: AccessCache,
  ) {}

  /** E.164 form of a typed number, or null when it is not a phone number. */
  normalize(raw: string): string | null {
    return toE164(raw, this.config.get('DEFAULT_PHONE_COUNTRY'));
  }

  /** The one ACTIVE user with this phone, when they hold an active PARENT role. */
  async findParent(phone: string): Promise<User | null> {
    const variants = phoneVariants(
      phone,
      this.config.get('DEFAULT_PHONE_COUNTRY'),
    );
    const users = await this.repository.activeUsersByPhone(variants);
    if (users.length !== 1) return null;
    return (await this.isParent(users[0].id)) ? users[0] : null;
  }

  async isParent(userId: string): Promise<boolean> {
    const assignments = await this.access.assignments(userId);
    return assignments.some((a) => a.roleKey === (RoleKey.PARENT as string));
  }
}
