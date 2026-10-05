import { Injectable } from '@nestjs/common';
import { argon2id, hash, verify, type HashOptions } from 'argon2';

const OPTIONS: HashOptions = {
  type: argon2id,
  memoryCost: 65_536,
  timeCost: 3,
  parallelism: 1,
};

@Injectable()
export class PasswordHasher {
  private dummyHash?: Promise<string>;

  hash(password: string): Promise<string> {
    return hash(password, OPTIONS);
  }

  verify(stored: string, password: string): Promise<boolean> {
    return verify(stored, password).catch(() => false);
  }

  /** Spends the same time as a real check so unknown users are not revealed. */
  async verifyDummy(password: string): Promise<false> {
    this.dummyHash ??= this.hash('dummy-password-for-timing-1');
    await this.verify(await this.dummyHash, password);
    return false;
  }
}
