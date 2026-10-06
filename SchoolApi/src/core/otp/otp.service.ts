import {
  createHash,
  randomInt,
  randomUUID,
  timingSafeEqual,
} from 'node:crypto';
import { Injectable } from '@nestjs/common';
import type { OtpPurpose } from '../../generated/prisma/client';
import { invalid } from '../common/errors/errors';
import { PrismaService } from '../prisma/prisma.service';

const TTL_MS = 5 * 60_000;
const MAX_ATTEMPTS = 5;

export interface IssuedOtp {
  id: string;
  code: string;
  expiresAt: Date;
}

/** One-time codes (security.md §1: 5 attempts, 5 minute expiry, hashed). */
@Injectable()
export class OtpService {
  constructor(private readonly prisma: PrismaService) {}

  generateCode(): string {
    return String(randomInt(0, 1_000_000)).padStart(6, '0');
  }

  async issue(
    destination: string,
    purpose: OtpPurpose,
    userId?: string,
  ): Promise<IssuedOtp> {
    const id = randomUUID();
    const code = this.generateCode();
    const expiresAt = new Date(Date.now() + TTL_MS);
    await this.prisma.otpCode.create({
      data: {
        id,
        userId,
        destination,
        purpose,
        codeHash: hashCode(id, code),
        expiresAt,
      },
    });
    return { id, code, expiresAt };
  }

  /** Consumes the code; wrong, expired or exhausted codes fail the same way. */
  async verify(id: string, purpose: OtpPurpose, code: string): Promise<void> {
    const otp = await this.prisma.otpCode.findUnique({ where: { id } });
    const usable =
      otp &&
      otp.purpose === purpose &&
      !otp.consumedAt &&
      otp.expiresAt > new Date() &&
      otp.attempts < MAX_ATTEMPTS;
    if (!usable) throw invalid('Code is invalid or expired');

    const matches = safeEqual(otp.codeHash, hashCode(id, code));
    const claimed = await this.prisma.otpCode.updateMany({
      where: { id, consumedAt: null, attempts: otp.attempts },
      data: matches
        ? { consumedAt: new Date(), attempts: { increment: 1 } }
        : { attempts: { increment: 1 } },
    });
    if (!matches || claimed.count === 0)
      throw invalid('Code is invalid or expired');
  }
}

function hashCode(id: string, code: string): string {
  return createHash('sha256').update(`${id}:${code}`).digest('hex');
}

function safeEqual(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}
