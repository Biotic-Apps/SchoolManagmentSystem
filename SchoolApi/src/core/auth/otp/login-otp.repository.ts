import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { OTP_MAX_ATTEMPTS } from './otp-code';

export interface NewLoginOtp {
  id: string;
  userId: string;
  phone: string;
  codeHash: string;
  expiresAt: Date;
}

@Injectable()
export class LoginOtpRepository {
  constructor(private readonly prisma: PrismaService) {}

  /** ACTIVE accounts whose stored phone is one of the given forms. */
  activeUsersByPhone(phones: string[]) {
    return this.prisma.user.findMany({
      where: { phone: { in: phones }, status: 'ACTIVE' },
      take: 2,
    });
  }

  async lastIssuedAt(phone: string): Promise<Date | null> {
    const row = await this.prisma.loginOtp.findFirst({
      where: { phone },
      orderBy: { createdAt: 'desc' },
      select: { createdAt: true },
    });
    return row?.createdAt ?? null;
  }

  /** Older unused codes of the phone stop working when a new one is issued. */
  async replace(otp: NewLoginOtp): Promise<void> {
    await this.prisma.$transaction([
      this.prisma.loginOtp.updateMany({
        where: { phone: otp.phone, usedAt: null },
        data: { usedAt: new Date() },
      }),
      this.prisma.loginOtp.create({ data: otp }),
    ]);
  }

  /** Newest code of the phone that can still be tried. */
  findUsable(phone: string) {
    return this.prisma.loginOtp.findFirst({
      where: {
        phone,
        usedAt: null,
        expiresAt: { gt: new Date() },
        attempts: { lt: OTP_MAX_ATTEMPTS },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /** Reserves one attempt before the code is compared (no parallel guessing). */
  async takeAttempt(id: string): Promise<boolean> {
    const { count } = await this.prisma.loginOtp.updateMany({
      where: { id, usedAt: null, attempts: { lt: OTP_MAX_ATTEMPTS } },
      data: { attempts: { increment: 1 } },
    });
    return count === 1;
  }

  async consume(id: string): Promise<boolean> {
    const { count } = await this.prisma.loginOtp.updateMany({
      where: { id, usedAt: null, expiresAt: { gt: new Date() } },
      data: { usedAt: new Date() },
    });
    return count === 1;
  }
}
