import { Injectable } from '@nestjs/common';
import { UserAuthPolicyService } from '../policy/user-auth-policy.service';
import { assertPasswordPolicy } from './password-policy';

/** Applies the strictest passwordPolicy of the schools a password is used in. */
@Injectable()
export class PasswordPolicyService {
  constructor(private readonly policies: UserAuthPolicyService) {}

  /** Existing user (reset, change): their current assignments' schools. */
  async assertForUser(userId: string, password: string): Promise<void> {
    const { passwordPolicy } = await this.policies.forUser(userId);
    assertPasswordPolicy(password, passwordPolicy);
  }

  /** New account: the schools it is being created in (`null` = all schools). */
  async assertForSchools(
    schoolIds: string[] | null,
    password: string,
  ): Promise<void> {
    const { passwordPolicy } = await this.policies.forSchools(schoolIds);
    assertPasswordPolicy(password, passwordPolicy);
  }
}
